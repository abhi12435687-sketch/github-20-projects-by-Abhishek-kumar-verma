
let assignments = [
    {
        id: 1,
        name: "IoT Smart Home Project",
        deadline: "20 November 2026"
    },
    {
        id: 2,
        name: "Database Management Project",
        deadline: "25 November 2026"
    },
    {
        id: 3,
        name: "Web Development Project",
        deadline: "30 November 2026"
    }
];

let submissions = [];

let currentUser = "";

function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let role = document.getElementById("role").value;

    if (username === "" || password === "") {
        alert("Please enter username and password");
        return;
    }

    currentUser = username;

    document.getElementById("loginSection").style.display = "none";
    document.getElementById("logoutBtn").style.display = "block";

    if (role === "student") {
        document.getElementById("studentDashboard").style.display = "block";
        document.getElementById("facultyDashboard").style.display = "none";

        showAssignments();
        showMySubmissions();
    } else {
        document.getElementById("facultyDashboard").style.display = "block";
        document.getElementById("studentDashboard").style.display = "none";

        showFacultySubmissions();
    }
}

function showAssignments() {
    let output = "";

    assignments.forEach(function(a) {
        output += `
            <div class="assignment">
                <h3>${a.name}</h3>
                <p>Deadline: ${a.deadline}</p>

                <input type="file" id="file${a.id}">
                <button onclick="submitProject(${a.id})">
                    Submit Project
                </button>
            </div>
        `;
    });

    document.getElementById("assignments").innerHTML = output;
}

function submitProject(id) {
    let file = document.getElementById("file" + id).files[0];

    if (!file) {
        alert("Please select a project file");
        return;
    }

    submissions.push({
        student: currentUser,
        assignmentId: id,
        fileName: file.name,
        status: "Submitted",
        marks: "Not Evaluated",
        feedback: "Waiting for faculty review"
    });

    alert("Project submitted successfully!");

    showMySubmissions();
    showFacultySubmissions();
}

function showMySubmissions() {
    let output = "";

    submissions.forEach(function(s) {
        if (s.student === currentUser) {
            let assignment = assignments.find(function(a) {
                return a.id === s.assignmentId;
            });

            output += `
                <div class="submission">
                    <h3>${assignment.name}</h3>
                    <p>File: ${s.fileName}</p>
                    <p class="status">Status: ${s.status}</p>
                    <p>Marks: ${s.marks}</p>
                    <p>Feedback: ${s.feedback}</p>
                </div>
            `;
        }
    });

    document.getElementById("mySubmissions").innerHTML =
        output || "No submissions yet";
}

function showFacultySubmissions() {
    let output = "";

    submissions.forEach(function(s, index) {
        let assignment = assignments.find(function(a) {
            return a.id === s.assignmentId;
        });

        output += `
            <div class="submission">
                <h3>${assignment.name}</h3>
                <p>Student: ${s.student}</p>
                <p>File: ${s.fileName}</p>
                <p>Status: ${s.status}</p>

                <input type="number" id="marks${index}"
                    placeholder="Enter marks">

                <textarea id="feedback${index}"
                    placeholder="Enter feedback"></textarea>

                <button onclick="evaluate(${index})">
                    Submit Review
                </button>
            </div>
        `;
    });

    document.getElementById("facultySubmissions").innerHTML =
        output || "No submissions received";
}

function evaluate(index) {
    let marks = document.getElementById("marks" + index).value;
    let feedback = document.getElementById("feedback" + index).value;

    if (marks === "" || Number(marks) < 0 || Number(marks) > 100) {
        alert("Enter valid marks between 0 and 100");
        return;
    }

    submissions[index].marks = marks;
    submissions[index].feedback = feedback;
    submissions[index].status = "Reviewed";

    alert("Review submitted successfully!");

    showFacultySubmissions();
}

function logout() {
    currentUser = "";

    document.getElementById("loginSection").style.display = "block";
    document.getElementById("studentDashboard").style.display = "none";
    document.getElementById("facultyDashboard").style.display = "none";
    document.getElementById("logoutBtn").style.display = "none";
}

