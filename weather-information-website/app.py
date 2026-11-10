"""WeatherGPT local server with server-side Google Maps Platform proxies."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen
import json
import os
import time
import threading
import uuid

ROOT = Path(__file__).parent

def read_key(name):
    key = os.environ.get(name)
    if not key:
        # .env.local is deliberately private and overrides the shared .env.
        for env_file in (ROOT / ".env.local", ROOT / ".env"):
            if not env_file.exists():
                continue
            value = None
            for line in env_file.read_text(encoding="utf-8").splitlines():
                if line.startswith(f"{name}="):
                    value = line.split("=", 1)[1].strip()
            if value:
                return value
    return key

GOOGLE_KEY = read_key("GOOGLE_MAPS_API_KEY")
OPENAI_KEY = read_key("OPENAI_API_KEY")
GEMINI_KEY = read_key("GEMINI_API_KEY")
# This is an API model name, not a Codex desktop model name. It is used by
# the Responses API below for the in-app chat service.
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-5-mini")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite")
# Track local WeatherGPT browser tabs and stop the hidden server when all are gone.
SESSION_LOCK = threading.Lock()
BROWSER_SESSIONS = {}
BROWSER_SESSION_STARTED = False
SERVER_INSTANCE = None

def update_browser_session(session_id, event):
    global BROWSER_SESSION_STARTED
    if not session_id or len(session_id) > 80:
        return False
    with SESSION_LOCK:
        if event == "heartbeat":
            BROWSER_SESSIONS[session_id] = time.monotonic()
            BROWSER_SESSION_STARTED = True
        elif event == "close":
            BROWSER_SESSIONS.pop(session_id, None)
        else:
            return False
    return True

def browser_idle_watchdog():
    while True:
        time.sleep(12)
        now = time.monotonic()
        with SESSION_LOCK:
            stale = [key for key, seen in BROWSER_SESSIONS.items() if now - seen > 45]
            for key in stale:
                BROWSER_SESSIONS.pop(key, None)
            idle = BROWSER_SESSION_STARTED and not BROWSER_SESSIONS
        if not idle:
            continue
        # Brief grace period lets a reload or another app tab register first.
        time.sleep(8)
        now = time.monotonic()
        with SESSION_LOCK:
            stale = [key for key, seen in BROWSER_SESSIONS.items() if now - seen > 45]
            for key in stale:
                BROWSER_SESSIONS.pop(key, None)
            server = SERVER_INSTANCE if BROWSER_SESSION_STARTED and not BROWSER_SESSIONS else None
        if server:
            server.shutdown()
            return

def google_request(url, method="GET", body=None, headers=None):
    request = Request(url, data=json.dumps(body).encode() if body is not None else None, method=method)
    for name, value in (headers or {}).items():
        request.add_header(name, value)
    with urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))

def openai_request(body):
    """Call the Responses API with retries for temporary network/service failures."""
    transient_statuses = {429, 500, 502, 503, 504}
    last_error = None
    for attempt in range(3):
        request = Request(
            "https://api.openai.com/v1/responses",
            data=json.dumps(body).encode("utf-8"),
            method="POST",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENAI_KEY}",
                "X-Client-Request-Id": str(uuid.uuid4()),
            },
        )
        try:
            with urlopen(request, timeout=35) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as error:
            last_error = error
            if error.code not in transient_statuses or attempt == 2:
                raise
        except (URLError, TimeoutError) as error:
            last_error = error
            if attempt == 2:
                raise
        time.sleep(1.5 * (attempt + 1))
    raise last_error

def gemini_request(contents, system_instruction):
    """Call Gemini server-side, keeping the API key out of the browser."""
    if not GEMINI_KEY:
        raise ValueError("Gemini API key is not configured.")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    body = {
        "system_instruction": {"parts": [{"text": system_instruction}]},
        "contents": [{"role": "user", "parts": [{"text": contents}]}],
        "generationConfig": {"temperature": 0.65, "maxOutputTokens": 700},
    }
    request = Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        method="POST",
        headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY},
    )
    with urlopen(request, timeout=35) as response:
        return json.loads(response.read().decode("utf-8"))

def gemini_text(result):
    parts = result.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    return "".join(part.get("text", "") for part in parts).strip()

class AppHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("Permissions-Policy", "geolocation=(self)")
        if self.headers.get("Origin") == "null" and urlparse(self.path).path.startswith("/api/google/"):
            self.send_header("Access-Control-Allow-Origin", "null")
            self.send_header("Vary", "Origin")
        super().end_headers()

    def json_response(self, payload, status=200):
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def google_error(self, error):
        try:
            payload = json.loads(error.read().decode("utf-8"))
        except Exception:
            payload = {"error": {"message": "Google Maps Platform request failed."}}
        self.json_response(payload, getattr(error, "code", 502))

    def do_GET(self):
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/google/"):
            return super().do_GET()
        if not GOOGLE_KEY:
            return self.json_response({"error": {"message": "Google API key is not configured."}}, 503)
        query = parse_qs(parsed.query)
        try:
            if parsed.path == "/api/google/places":
                return self.places(query.get("q", [""])[0])
            lat, lon = float(query["lat"][0]), float(query["lon"][0])
            if parsed.path == "/api/google/weather":
                return self.weather(lat, lon)
            if parsed.path == "/api/google/hourly-forecast":
                return self.hourly_forecast(lat, lon)
            if parsed.path == "/api/google/alerts":
                return self.alerts(lat, lon)
            if parsed.path == "/api/google/air-quality":
                return self.air_quality(lat, lon)
            return self.json_response({"error": {"message": "Unknown Google endpoint."}}, 404)
        except (KeyError, ValueError):
            return self.json_response({"error": {"message": "Valid latitude and longitude are required."}}, 400)
        except HTTPError as error:
            return self.google_error(error)
        except (URLError, TimeoutError):
            return self.json_response({"error": {"message": "Unable to reach Google Maps Platform."}}, 502)

    def do_POST(self):
        if self.path == "/api/lifecycle":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                session_id = str(payload.get("sessionId", ""))
                event = str(payload.get("event", ""))
                if not update_browser_session(session_id, event):
                    return self.json_response({"error": {"message": "Invalid browser session event."}}, 400)
                return self.json_response({"ok": True})
            except (ValueError, json.JSONDecodeError):
                return self.json_response({"error": {"message": "Invalid browser session request."}}, 400)
        if self.path != "/api/chat":
            return self.json_response({"error": {"message": "Unknown endpoint."}}, 404)
        if not GEMINI_KEY and not OPENAI_KEY:
            return self.json_response({"error": {"message": "No AI API key is configured."}}, 503)
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            messages = payload.get("messages", [])[-12:]
            context = payload.get("weatherContext", "No live weather is available yet.")
            transcript = "\n".join(
                f"{'User' if message.get('role') == 'user' else 'Assistant'}: {str(message.get('content', ''))[:1200]}"
                for message in messages
            )
            instructions = "You are WeatherGPT, a reliable general AI assistant with live weather context. Reply in the user's language. Answer ordinary questions directly and accurately. For current weather or location facts, use only the supplied live context and never invent measurements or warnings. Clearly state uncertainty or limits when reliable information is unavailable. Keep answers helpful and concise."
            prompt = f"LIVE WEATHER CONTEXT:\n{context}\n\nCONVERSATION:\n{transcript}"
            if GEMINI_KEY:
                answer = gemini_text(gemini_request(prompt, instructions))
            else:
                result = openai_request({"model": OPENAI_MODEL, "instructions": instructions, "input": prompt, "store": False})
                answer = result.get("output_text", "")
                if not answer:
                    for item in result.get("output", []):
                        for content in item.get("content", []):
                            if content.get("type") == "output_text":
                                answer += content.get("text", "")
            return self.json_response({"answer": answer or "I couldn't generate a response right now."})
        except HTTPError as error:
            return self.google_error(error)
        except (ValueError, json.JSONDecodeError):
            return self.json_response({"error": {"message": "Invalid chat request."}}, 400)
        except (URLError, TimeoutError) as error:
            reason = getattr(error, "reason", "request timed out")
            return self.json_response({"error": {"message": f"AI service connection failed: {reason}"}}, 503)

    def places(self, text):
        result = google_request("https://places.googleapis.com/v1/places:searchText", "POST", {"textQuery": text, "languageCode": "en"}, {"Content-Type": "application/json", "X-Goog-Api-Key": GOOGLE_KEY, "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location"})
        places = []
        for place in result.get("places", []):
            location = place.get("location", {})
            if "latitude" in location and "longitude" in location:
                places.append({"name": place.get("displayName", {}).get("text", "Unnamed location"), "address": place.get("formattedAddress", ""), "latitude": location["latitude"], "longitude": location["longitude"]})
        self.json_response({"places": places})

    def weather(self, lat, lon):
        params = urlencode({"key": GOOGLE_KEY, "location.latitude": lat, "location.longitude": lon, "days": 10})
        current = google_request(f"https://weather.googleapis.com/v1/currentConditions:lookup?{params}")
        forecast = google_request(f"https://weather.googleapis.com/v1/forecast/days:lookup?{params}")
        self.json_response({"current": current, "forecast": forecast})

    def hourly_forecast(self, lat, lon):
        params = urlencode({"key": GOOGLE_KEY, "location.latitude": lat, "location.longitude": lon, "hours": 240})
        self.json_response(google_request(f"https://weather.googleapis.com/v1/forecast/hours:lookup?{params}"))

    def alerts(self, lat, lon):
        params = urlencode({"key": GOOGLE_KEY, "location.latitude": lat, "location.longitude": lon, "languageCode": "en"})
        result = google_request(f"https://weather.googleapis.com/v1/publicAlerts:lookup?{params}")
        self.json_response(result)

    def air_quality(self, lat, lon):
        result = google_request(f"https://airquality.googleapis.com/v1/currentConditions:lookup?key={GOOGLE_KEY}", "POST", {"location": {"latitude": lat, "longitude": lon}, "universalAqi": True, "languageCode": "en"}, {"Content-Type": "application/json"})
        self.json_response(result)

if __name__ == "__main__":
    os.chdir(ROOT)
    port = int(os.environ.get("WEATHERGPT_PORT", "8766"))
    print(f"WeatherGPT is running at http://127.0.0.1:{port}")
    SERVER_INSTANCE = ThreadingHTTPServer(("127.0.0.1", port), AppHandler)
    threading.Thread(target=browser_idle_watchdog, name="weathergpt-tab-watchdog", daemon=True).start()
    try:
        SERVER_INSTANCE.serve_forever()
    finally:
        SERVER_INSTANCE.server_close()
