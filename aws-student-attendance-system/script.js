
let dateInput = document.getElementById("date");

// Add student
document.getElementById("studentForm").addEventListener("submit", async function(e) {

    e.preventDefault();

    let student = {
        name: document.getElementById("name").value,
        department: document.getElementById("department").value
    };

    let response = await fetch("/addStudent", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(student)
    });

    let result = await response.json();

    document.getElementById("result").innerText = result.message;

    document.getElementById("studentForm").reset();

    loadAttendance();
});


// Load attendance
async function loadAttendance() {

    let date = dateInput.value;

    if (date == "") {
        document.getElementById("result").innerText = "Please select a date";
        return;
    }

    let response = await fetch("/attendance?date=" + date);
    let students = await response.json();

    let output = `
        <table>
            <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Status</th>
                <th>Percentage</th>
                <th>Action</th>
            </tr>
    `;

    students.forEach(function(student) {

        output += `
            <tr>
                <td>${student.name}</td>
                <td>${student.department}</td>
                <td>
                    <select id="status${student.id}">
                        <option value="Present" ${student.status == "Present" ? "selected" : ""}>Present</option>
                        <option value="Absent" ${student.status == "Absent" ? "selected" : ""}>Absent</option>
                    </select>
                </td>
                <td>${student.percentage ?? 0}%</td>
                <td>
                    <button onclick="saveAttendance(${student.id})">Save</button>
                </td>
            </tr>
        `;
    });

    output += "</table>";

    document.getElementById("attendanceList").innerHTML = output;
}


// Save attendance
async function saveAttendance(id) {

    let data = {
        student_id: id,
        date: dateInput.value,
        status: document.getElementById("status" + id).value
    };

    let response = await fetch("/saveAttendance", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });

    let result = await response.json();

    document.getElementById("result").innerText = result.message;

    loadAttendance();
}
