
// Food menu
const foods = [
    { id: 1, name: "Cheese Burger", price: 149 },
    { id: 2, name: "Margherita Pizza", price: 249 },
    { id: 3, name: "White Sauce Pasta", price: 199 },
    { id: 4, name: "Farmhouse Pizza", price: 299 }
];

// Shopping cart
let cart = [];

// Add food to cart
function addToCart(id) {

    let food = foods.find(item => item.id === id);

    let existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...food,
            quantity: 1
        });
    }

    displayCart();
}

// Increase or decrease quantity
function changeQuantity(id, change) {

    let item = cart.find(item => item.id === id);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeItem(id);
        return;
    }

    displayCart();
}

// Remove item from cart
function removeItem(id) {

    cart = cart.filter(item => item.id !== id);

    displayCart();
}

// Display cart items
function displayCart() {

    let cartContainer = document.getElementById("cart-items");

    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML =
            '<p class="empty">Your cart is empty.</p>';
    }

    cart.forEach(item => {

        cartContainer.innerHTML += `
            <div class="cart-item">

                <div>
                    <h3>${item.name}</h3>
                    <p>₹${item.price} × ${item.quantity}</p>
                </div>

                <div class="quantity">

                    <button onclick="changeQuantity(${item.id}, -1)">-</button>

                    <span>${item.quantity}</span>

                    <button onclick="changeQuantity(${item.id}, 1)">+</button>

                </div>

                <strong>₹${item.price * item.quantity}</strong>

                <button class="remove-btn"
                    onclick="removeItem(${item.id})">
                    Remove
                </button>

            </div>
        `;
    });

    updateSummary();
}

// Calculate bill
function updateSummary() {

    let subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    let delivery = subtotal > 0 ? 30 : 0;

    let total = subtotal + delivery;

    document.getElementById("subtotal").textContent = subtotal;

    document.getElementById("delivery").textContent = delivery;

    document.getElementById("total").textContent = total;
}

// Place order
function placeOrder() {

    if (cart.length === 0) {
        alert("Please add items to your cart first!");
        return;
    }

    let total = document.getElementById("total").textContent;

    alert("Order placed successfully! Your total is ₹" + total);

    cart = [];

    displayCart();
}

// Initial display
displayCart();
