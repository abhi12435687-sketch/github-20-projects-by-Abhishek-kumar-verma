
let timeLeft = 300;
let timerInterval;
let submitted = false;


// Register student
async function register() {

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let response = await fetch("/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
    });

    let data = await response.json();

    document.getElementById("message").innerText = data.message;
}


// Student login
async function login() {

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let response = await fetch("/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
    });

    let data = await response.json();

    if (response.ok) {
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("examBox").style.display = "block";

        loadQuestions();
    } else {
        document.getElementById("message").innerText = data.message;
    }
}


// Load questions
async function loadQuestions() {

    let response = await fetch("/questions");
    let questions = await response.json();

    let output = "";

    questions.forEach(function(q, index) {

        output += `
            <div class="question">
                <h3>${index + 1}. ${q.question}</h3>

                <label>
                    <input type="radio" name="q${q.id}" value="1">
                    ${q.option1}
                </label>

                <label>
                    <input type="radio" name="q${q.id}" value="2">
                    ${q.option2}
                </label>

                <label>
                    <input type="radio" name="q${q.id}" value="3">
                    ${q.option3}
                </label>

                <label>
                    <input type="radio" name="q${q.id}" value="4">
                    ${q.option4}
                </label>
            </div>
        `;
    });

    document.getElementById("questions").innerHTML = output;

    startTimer();
}


// Countdown timer
function startTimer() {

    timerInterval = setInterval(function() {

        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        document.getElementById("timer").innerText =
            minutes + ":" + String(seconds).padStart(2, "0");

        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timerInterval);
            submitExam();
        }

    }, 1000);
}


// Submit exam
async function submitExam() {

    if (submitted) return;

    submitted = true;
    clearInterval(timerInterval);

    let answers = {};

    document.querySelectorAll(".question").forEach(function(question) {

        let selected = question.querySelector("input:checked");

        if (selected) {
            let id = selected.name.substring(1);
            answers[id] = Number(selected.value);
        }

    });

    let response = await fetch("/submit", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({answers})
    });

    let data = await response.json();

    document.getElementById("examBox").style.display = "none";
    document.getElementById("resultBox").style.display = "block";

    if (response.ok) {
        document.getElementById("result").innerText =
            "Your Marks: " + data.marks + " / " + data.total;
    } else {
        document.getElementById("result").innerText = data.message;
    }
}
