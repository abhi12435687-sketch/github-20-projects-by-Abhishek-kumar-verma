
// Get registration form
let form = document.getElementById("registrationForm");

// Select event when Register Now is clicked
function selectEvent(eventName) {

    document.getElementById("event").value = eventName;

    document.getElementById("register").scrollIntoView({
        behavior: "smooth"
    });
}

// Handle form submission
form.addEventListener("submit", function(event) {

    // Prevent page refresh
    event.preventDefault();

    // Get input values
    let name = document.getElementById("name").value.trim();

    let email = document.getElementById("email").value.trim();

    let roll = document.getElementById("roll").value.trim();

    let selectedEvent = document.getElementById("event").value;

    let confirmation = document.getElementById("confirmation");

    // Validate empty fields
    if (
        name === "" ||
        email === "" ||
        roll === "" ||
        selectedEvent === ""
    ) {
        alert("Please fill all the fields!");
        return;
    }

    // Validate name
    if (!/^[A-Za-z ]+$/.test(name)) {
        alert("Please enter a valid name.");
        return;
    }

    // Validate email
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Validate roll number
    if (roll.length < 3) {
        alert("Please enter a valid roll number.");
        return;
    }

    // Display confirmation
    confirmation.style.display = "block";

    confirmation.innerHTML = `
        <h3>Registration Successful!</h3>
        <p>Thank you, ${name}.</p>
        <p>Your registration for <strong>${selectedEvent}</strong>
        has been submitted successfully.</p>
        <p>We look forward to seeing you at the event!</p>
    `;

    // Clear form
    form.reset();

    // Scroll to confirmation
    confirmation.scrollIntoView({
        behavior: "smooth"
    });

});
