
// Book collection
const books = [
    {
        id: 1,
        title: "The Alchemist",
        author: "Paulo Coelho",
        category: "Fiction",
        price: 299,
        image: "https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg"
    },
    {
        id: 2,
        title: "Harry Potter",
        author: "J.K. Rowling",
        category: "Fiction",
        price: 399,
        image: "https://covers.openlibrary.org/b/isbn/9780590353427-M.jpg"
    },
    {
        id: 3,
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Technology",
        price: 599,
        image: "https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg"
    },
    {
        id: 4,
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        category: "Science",
        price: 349,
        image: "https://covers.openlibrary.org/b/isbn/9780553380163-M.jpg"
    },
    {
        id: 5,
        title: "Atomic Habits",
        author: "James Clear",
        category: "Self Help",
        price: 449,
        image: "https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg"
    },
    {
        id: 6,
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        category: "Fiction",
        price: 329,
        image: "https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg"
    }
];

// Shopping cart
let cart = [];

// Display all books
function displayBooks() {

    let container = document.getElementById("book-container");

    let searchValue = document
        .getElementById("search")
        .value.toLowerCase();

    let categoryValue = document
        .getElementById("category")
        .value;

    // Search and category filtering
    let filteredBooks = books.filter(book => {

        let matchesSearch =
            book.title.toLowerCase().includes(searchValue) ||
            book.author.toLowerCase().includes(searchValue);

        let matchesCategory =
            categoryValue === "All" ||
            book.category === categoryValue;

        return matchesSearch && matchesCategory;
    });

    container.innerHTML = "";

    if (filteredBooks.length === 0) {
        container.innerHTML = "<p>No books found.</p>";
        return;
    }

    filteredBooks.forEach(book => {

        container.innerHTML += `
            <div class="book-card">

                <img src="${book.image}" alt="${book.title}"
                     onerror="this.style.display='none'">

                <h3>${book.title}</h3>

                <p>By ${book.author}</p>

                <p>${book.category}</p>

                <p class="price">₹${book.price}</p>

                <button onclick="addToCart(${book.id})">
                    Add to Cart
                </button>

            </div>
        `;
    });
}

// Add book to cart
function addToCart(id) {

    let book = books.find(item => item.id === id);

    let existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...book,
            quantity: 1
        });
    }

    displayCart();
}

// Remove book from cart
function removeFromCart(id) {

    cart = cart.filter(item => item.id !== id);

    displayCart();
}

// Change quantity
function changeQuantity(id, change) {

    let item = cart.find(item => item.id === id);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(id);
        return;
    }

    displayCart();
}

// Display cart
function displayCart() {

    let container = document.getElementById("cart-items");

    container.innerHTML = "";

    if (cart.length === 0) {

        container.innerHTML =
            '<p class="empty">Your cart is empty.</p>';

    }

    cart.forEach(item => {

        container.innerHTML += `
            <div class="cart-item">

                <div>
                    <h3>${item.title}</h3>
                    <p>₹${item.price} × ${item.quantity}</p>
                </div>

                <div>
                    <button onclick="changeQuantity(${item.id}, -1)">-</button>

                    <span>${item.quantity}</span>

                    <button onclick="changeQuantity(${item.id}, 1)">+</button>
                </div>

                <strong>₹${item.price * item.quantity}</strong>

                <button onclick="removeFromCart(${item.id})">
                    Remove
                </button>

            </div>
        `;
    });

    updateTotal();
}

// Calculate total price
function updateTotal() {

    let total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    let count = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    document.getElementById("total").textContent = total;

    document.getElementById("item-count").textContent = count;
}

// Checkout
function checkout() {

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let total = document.getElementById("total").textContent;

    alert("Order placed successfully! Total amount: ₹" + total);

    cart = [];

    displayCart();
}

// Initial display
displayBooks();
displayCart();
