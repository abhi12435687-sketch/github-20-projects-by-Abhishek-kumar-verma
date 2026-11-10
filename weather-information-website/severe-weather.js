(() => {
  const card = document.getElementById('severeCountdown');
  if (!card) return;

  const titleNode = document.getElementById('severeTitle');
  const timerNode = document.getElementById('severeTimer');
  const sourceNode = document.getElementById('severeSource');
  const proxyRoot = window.location.protocol === 'file:' ? 'http://127.0.0.1:8778' : '';
  const forecastLabels = new Map([
    ['HEAVY_RAIN', 'Heavy rain'], ['HEAVY_RAIN_SHOWERS', 'Heavy rain'],
    ['MODERATE_TO_HEAVY_RAIN', 'Heavy rain'], ['RAIN_PERIODICALLY_HEAVY', 'Heavy rain'],
    ['HEAVY_THUNDERSTORM', 'Heavy thunderstorm'],
    ['HEAVY_SNOW', 'Heavy snow'], ['HEAVY_SNOW_SHOWERS', 'Heavy snow'],
    ['MODERATE_TO_HEAVY_SNOW', 'Heavy snow'], ['SNOW_PERIODICALLY_HEAVY', 'Heavy snow'],
    ['HEAVY_SNOW_STORM', 'Heavy snow']
  ]);
  let selectedEvent = null;
  let requestVersion = 0;

  const json = async url => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Google weather data is unavailable');
    return response.json();
  };
  const apiUrl = (path, lat, lon) => proxyRoot + '/api/google/' + path +
    '?lat=' + encodeURIComponent(lat) + '&lon=' + encodeURIComponent(lon);

  function forecastEvents(data, now, horizon) {
    const events = [];
    for (const hour of data?.forecastHours || []) {
      const type = hour.weatherCondition?.type;
      const label = forecastLabels.get(type);
      if (!label) continue;
      const probability = label === 'Heavy thunderstorm'
        ? Number(hour.thunderstormProbability)
        : Number(hour.precipitation?.probability?.percent);
      if (!Number.isFinite(probability) || probability < 50) continue;
      const start = Date.parse(hour.interval?.startTime || '');
      if (Number.isFinite(start) && start > now && start <= horizon) {
        events.push({label, start, source: 'Google hourly forecast'});
      }
    }
    return events;
  }

  function alertLabel(alert) {
    const type = String(alert.eventType || '').toUpperCase();
    if (/CYCLONE|HURRICANE|TYPHOON|TROPICAL_STORM/.test(type)) return 'Cyclone warning';
    if (/THUNDER/.test(type)) return 'Severe thunderstorm warning';
    if (/SNOW|BLIZZARD|WINTER_STORM/.test(type)) return 'Severe snow warning';
    if (/RAIN|FLOOD/.test(type)) return 'Severe rain or flood warning';
    if (/TORNADO/.test(type)) return 'Tornado warning';
    if (/STORM|WIND|HAIL/.test(type)) return 'Severe storm warning';
    return '';
  }

  function alertEvents(data, now, horizon) {
    const events = [];
    for (const alert of data?.weatherAlerts || []) {
      if (!['SEVERE', 'EXTREME'].includes(String(alert.severity || '').toUpperCase())) continue;
      if (!['LIKELY', 'VERY_LIKELY', 'OBSERVED'].includes(String(alert.certainty || '').toUpperCase())) continue;
      const start = Date.parse(alert.startTime || '');
      const end = Date.parse(alert.expirationTime || '');
      if (!Number.isFinite(start) || start <= now || start > horizon || (Number.isFinite(end) && end <= now)) continue;
      const label = alertLabel(alert);
      if (!label) continue;
      events.push({label, start, alert, source: alert.dataSource});
    }
    return events;
  }

  function formatCountdown(start) {
    const ms = start - Date.now();
    if (ms <= 0) return 'Starting now';
    const minutes = Math.ceil(ms / 60000);
    if (minutes >= 1440) return Math.ceil(minutes / 1440) + ' days';
    if (minutes >= 60) return Math.ceil(minutes / 60) + ' hours';
    return minutes + ' minutes';
  }

  function render() {
    if (!selectedEvent) { card.hidden = true; return; }
    titleNode.textContent = selectedEvent.label;
    timerNode.textContent = formatCountdown(selectedEvent.start);
    sourceNode.replaceChildren();
    if (selectedEvent.alert) {
      const source = selectedEvent.alert.dataSource || {};
      if (source.authorityUri && /^https:\/\//i.test(source.authorityUri)) {
        const link = document.createElement('a');
        link.href = source.authorityUri;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = source.name || 'Official weather authority';
        sourceNode.append(link);
      } else {
        sourceNode.textContent = source.name || 'Google public weather alert';
      }
    } else {
      sourceNode.textContent = 'Google hourly forecast · timing may change';
    }
    card.hidden = false;
  }

  async function refresh(lat, lon) {
    const version = ++requestVersion;
    selectedEvent = null;
    render();
    const now = Date.now();
    const horizon = now + 10 * 86400000;
    const [forecastResult, alertResult] = await Promise.allSettled([
      json(apiUrl('hourly-forecast', lat, lon)),
      json(apiUrl('alerts', lat, lon))
    ]);
    if (version !== requestVersion) return;
    const events = [];
    if (forecastResult.status === 'fulfilled') events.push(...forecastEvents(forecastResult.value, now, horizon));
    if (alertResult.status === 'fulfilled') events.push(...alertEvents(alertResult.value, now, horizon));
    events.sort((a, b) => a.start - b.start);
    selectedEvent = events[0] || null;
    render();
  }

  const style = document.createElement('style');
  style.textContent = '.severe-countdown{margin-top:12px;padding:11px 14px;display:flex;align-items:center;justify-content:space-between;gap:14px;border:1px solid color-mix(in srgb,#e45b45 42%,var(--line));border-radius:13px;background:color-mix(in srgb,#e45b45 13%,var(--card));color:var(--ink);box-shadow:0 8px 18px rgba(30,45,55,.09)}.severe-countdown[hidden]{display:none}.severe-countdown-copy{display:grid;gap:3px}.severe-countdown-copy strong{font-size:13px;color:#a52f25}.severe-countdown-copy small{font-size:10px;color:var(--muted)}.severe-countdown-copy a{color:inherit}.severe-countdown-timer{white-space:nowrap;font:600 19px "DM Mono",monospace;color:#a52f25}body.dark .severe-countdown-copy strong,body.dark .severe-countdown-timer{color:#ff9a87}@media(max-width:650px){.severe-countdown{align-items:flex-start}.severe-countdown-timer{font-size:16px}}';
  document.head.append(style);
  window.refreshSevereWeather = refresh;
  window.setInterval(render, 30000);
})();
