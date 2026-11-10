
// Notice Data

let notices = [

    {
        title: "End Semester Examination Schedule",
        description: "The examination timetable has been released. Students should check the complete schedule.",
        category: "Examination",
        date: "09 November 2026",
        important: true,
        file: "notices/exam.pdf"
    },

    {
        title: "Annual Technical Fest",
        description: "Registration is now open for the annual college technical fest.",
        category: "Events",
        date: "08 November 2026",
        important: true,
        file: "notices/fest.pdf"
    },

    {
        title: "College Holiday Notice",
        description: "The college will remain closed on the announced holiday.",
        category: "General",
        date: "07 November 2026",
        important: false,
        file: "notices/holiday.pdf"
    },

    {
        title: "Internal Assessment Schedule",
        description: "Internal assessment dates have been announced for all departments.",
        category: "Academic",
        date: "06 November 2026",
        important: false,
        file: "#"
    },

    {
        title: "Campus Placement Drive",
        description: "A new placement opportunity is available for eligible students.",
        category: "Placement",
        date: "05 November 2026",
        important: true,
        file: "#"
    },

    {
        title: "Library Timing Update",
        description: "New library timings have been announced for students.",
        category: "Academic",
        date: "04 November 2026",
        important: false,
        file: "#"
    }

];


// Display Notices

function displayNotices(data) {

    let container = document.getElementById("noticeContainer");

    container.innerHTML = "";

    document.getElementById("noResult").style.display = "none";

    if (data.length == 0) {

        document.getElementById("noResult").style.display = "block";

        return;
    }

    for (let i = 0; i < data.length; i++) {

        let notice = data[i];

        let card = document.createElement("div");

        card.className = "notice-card";

        if (notice.important == true) {

            card.classList.add("important");

        }

        let importantText = "";

        if (notice.important == true) {

            importantText = '<span class="important">★ IMPORTANT</span>';

        }

        let fileLink = "";

        if (notice.file != "#") {

            fileLink = `<a href="${notice.file}" target="_blank">View Notice Document →</a>`;

        }

        card.innerHTML = `

            <span class="category">${notice.category}</span>

            ${importantText}

            <div class="date">Published: ${notice.date}</div>

            <h3>${notice.title}</h3>

            <p>${notice.description}</p>

            ${fileLink}

        `;

        container.appendChild(card);

    }

}


// Filter Notices

function filterNotices(category) {

    let filtered = [];

    for (let i = 0; i < notices.length; i++) {

        if (category == "All" || notices[i].category == category) {

            filtered.push(notices[i]);

        }

    }

    displayNotices(filtered);

    let buttons = document.querySelectorAll(".categories button");

    for (let i = 0; i < buttons.length; i++) {

        buttons[i].classList.remove("active");

        if (buttons[i].innerText == category) {

            buttons[i].classList.add("active");

        }

    }

}


// Search Notices

document.getElementById("search").addEventListener("input", function() {

    let searchValue = this.value.toLowerCase();

    let filtered = [];

    for (let i = 0; i < notices.length; i++) {

        let title = notices[i].title.toLowerCase();

        let description = notices[i].description.toLowerCase();

        if (title.includes(searchValue) || description.includes(searchValue)) {

            filtered.push(notices[i]);

        }

    }

    displayNotices(filtered);

});


// Show All Notices Initially

displayNotices(notices);
