
let budget = 0;

let expenses = [];

function setBudget() {

    let value = Number(document.getElementById("budget").value);

    if (value <= 0 || !Number.isFinite(value)) {
        alert("Please enter a valid budget.");
        return;
    }

    budget = value;

    updateSummary();

}

function addExpense() {

    let name = document.getElementById("expense-name").value.trim();

    let amount = Number(document.getElementById("expense-amount").value);

    let category = document.getElementById("category").value;

    let message = document.getElementById("message");

    if (name === "" || category === "" ||
        !Number.isFinite(amount) || amount <= 0) {

        message.innerHTML = "Please enter all expense details correctly.";
        message.style.color = "red";

        return;
    }

    let expense = {
        name: name,
        amount: amount,
        category: category
    };

    expenses.push(expense);

    document.getElementById("expense-name").value = "";
    document.getElementById("expense-amount").value = "";
    document.getElementById("category").value = "";

    message.innerHTML = "Expense added successfully!";
    message.style.color = "green";

    displayExpenses();

    updateSummary();

}

function displayExpenses() {

    let list = document.getElementById("expense-list");

    list.innerHTML = "";

    if (expenses.length === 0) {

        list.innerHTML = "<p>No expenses added yet.</p>";

        return;

    }

    expenses.forEach(function(expense, index) {

        let div = document.createElement("div");

        div.classList.add("expense-item");

        let details = document.createElement("div");

        let name = document.createElement("h3");
        name.textContent = expense.name;

        let category = document.createElement("p");
        category.textContent = expense.category;

        let amount = document.createElement("p");
        amount.textContent = "₹" + expense.amount.toFixed(2);

        details.appendChild(name);
        details.appendChild(category);
        details.appendChild(amount);

        let button = document.createElement("button");

        button.textContent = "Delete";
        button.classList.add("delete-btn");

        button.onclick = function() {
            deleteExpense(index);
        };

        div.appendChild(details);
        div.appendChild(button);

        list.appendChild(div);

    });

}

function deleteExpense(index) {

    expenses.splice(index, 1);

    displayExpenses();

    updateSummary();

}

function updateSummary() {

    let total = 0;

    for (let i = 0; i < expenses.length; i++) {

        total += expenses[i].amount;

    }

    let remaining = budget - total;

    document.getElementById("total-budget").innerHTML =
        "₹" + budget.toFixed(2);

    document.getElementById("total-expenses").innerHTML =
        "₹" + total.toFixed(2);

    document.getElementById("remaining-budget").innerHTML =
        "₹" + remaining.toFixed(2);

    if (remaining < 0) {

        document.getElementById("remaining-budget").style.color = "red";

    }

    else {

        document.getElementById("remaining-budget").style.color = "green";

    }

}

