
let questions = [
    {
        question: "Which language is used to create the structure of a webpage?",
        options: ["CSS", "HTML", "JavaScript", "Python"],
        answer: 1
    },

    {
        question: "Which language is used for styling a webpage?",
        options: ["HTML", "C++", "CSS", "Java"],
        answer: 2
    },

    {
        question: "Which keyword is used to declare a variable in JavaScript?",
        options: ["let", "print", "include", "define"],
        answer: 0
    },

    {
        question: "Which company developed JavaScript's original implementation?",
        options: ["Microsoft", "Sun Microsystems", "Netscape", "Google"],
        answer: 2
    },

    {
        question: "Which HTML tag is used to create a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        answer: 1
    }
];

let currentQuestion = 0;
let userAnswers = new Array(questions.length).fill(null);

function loadQuestion() {

    let q = questions[currentQuestion];

    document.getElementById("question").innerHTML = q.question;

    document.getElementById("question-number").innerHTML =
        "Question " + (currentQuestion + 1) + " of " + questions.length;

    document.getElementById("score").innerHTML =
        "Score: " + calculateScore();

    document.getElementById("progress-bar").style.width =
        ((currentQuestion + 1) / questions.length) * 100 + "%";

    let optionsDiv = document.getElementById("options");

    optionsDiv.innerHTML = "";

    q.options.forEach(function(option, index) {

        let div = document.createElement("div");

        div.innerHTML = option;
        div.classList.add("option");

        if (userAnswers[currentQuestion] === index) {

            div.classList.add("selected");

            if (index === q.answer) {
                div.classList.add("correct");
            } else {
                div.classList.add("incorrect");
            }
        }

        div.onclick = function() {
            selectAnswer(index);
        };

        optionsDiv.appendChild(div);

    });

    showFeedback();

    document.getElementById("prev-btn").disabled =
        currentQuestion === 0;

    document.getElementById("next-btn").innerHTML =
        currentQuestion === questions.length - 1 ? "Submit Quiz" : "Next";

}

function selectAnswer(index) {

    userAnswers[currentQuestion] = index;

    loadQuestion();

}

function showFeedback() {

    let feedback = document.getElementById("feedback");

    let answer = userAnswers[currentQuestion];

    if (answer === null) {
        feedback.innerHTML = "";
    }

    else if (answer === questions[currentQuestion].answer) {
        feedback.innerHTML = "Correct Answer!";
        feedback.style.color = "green";
    }

    else {
        feedback.innerHTML = "Incorrect Answer!";
        feedback.style.color = "red";
    }

}

function calculateScore() {

    let score = 0;

    for (let i = 0; i < questions.length; i++) {

        if (userAnswers[i] === questions[i].answer) {
            score++;
        }

    }

    return score;
}

function nextQuestion() {

    if (currentQuestion < questions.length - 1) {

        currentQuestion++;
        loadQuestion();

    }

    else {

        showResult();

    }

}

function previousQuestion() {

    if (currentQuestion > 0) {

        currentQuestion--;
        loadQuestion();

    }

}

function showResult() {

    let score = calculateScore();

    document.getElementById("quiz").style.display = "none";

    document.getElementById("result-container").style.display = "block";

    document.getElementById("final-score").innerHTML =
        "Your Score: " + score + " / " + questions.length;

    document.getElementById("result-message").innerHTML =
        score === questions.length ? "Excellent Performance!" :
        score >= 3 ? "Good Job! Keep Practicing!" :
        "Keep Learning and Try Again!";

}

function restartQuiz() {

    currentQuestion = 0;

    userAnswers = new Array(questions.length).fill(null);

    document.getElementById("quiz").style.display = "block";

    document.getElementById("result-container").style.display = "none";

    loadQuestion();

}

// Load the first question
loadQuestion();
