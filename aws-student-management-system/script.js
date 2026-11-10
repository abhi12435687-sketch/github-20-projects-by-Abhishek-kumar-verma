
let form = document.getElementById("studentForm");

// Add or update student
form.addEventListener("submit", async function(e) {

    e.preventDefault();

    let id = document.getElementById("studentId").value;

    let student = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        department: document.getElementById("department").value,
        year: document.getElementById("year").value
    };

    let url = id ? "/students/" + id : "/students";
    let method = id ? "PUT" : "POST";

    let response = await fetch(url, {
        method: method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(student)
    });

    let result = await response.json();

    document.getElementById("message").innerText = result.message;

    form.reset();
    document.getElementById("studentId").value = "";
    document.getElementById("submitBtn").innerText = "Add Student";

    loadStudents();
});


// Load and search students
async function loadStudents() {

    let search = document.getElementById("search").value;

    let response = await fetch("/students?search=" + encodeURIComponent(search));
    let students = await response.json();

    let output = "";

    students.forEach(function(student) {

        output += `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.department}</td>
                <td>${student.year}</td>
                <td>
                    <button class="edit" onclick="editStudent(${student.id})">Edit</button>
                    <button class="delete" onclick="deleteStudent(${student.id})">Delete</button>
                </td>
            </tr>
        `;

    });

    document.getElementById("studentList").innerHTML = output;
}


// Edit student
async function editStudent(id) {

    let response = await fetch("/students");
    let students = await response.json();

    let student = students.find(s => s.id == id);

    if (student) {
        document.getElementById("studentId").value = student.id;
        document.getElementById("name").value = student.name;
        document.getElementById("email").value = student.email;
        document.getElementById("department").value = student.department;
        document.getElementById("year").value = student.year;

        document.getElementById("submitBtn").innerText = "Update Student";
    }
}


// Delete student
async function deleteStudent(id) {

    if (!confirm("Delete this student?")) {
        return;
    }

    let response = await fetch("/students/" + id, {
        method: "DELETE"
    });

    let result = await response.json();

    document.getElementById("message").innerText = result.message;

    loadStudents();
}


// Show all students when page opens
loadStudents();
