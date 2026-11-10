
document.getElementById("feedbackForm").addEventListener("submit", async function(e) {

    e.preventDefault();

    let data = {
        name: document.getElementById("name").value,
        department: document.getElementById("department").value,
        feedback: document.getElementById("feedback").value,
        rating: document.getElementById("rating").value
    };

    let response = await fetch("/feedback", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    let result = await response.json();

    document.getElementById("result").innerText = result.message;

    document.getElementById("feedbackForm").reset();

});
