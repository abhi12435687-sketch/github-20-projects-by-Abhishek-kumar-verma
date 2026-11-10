
let products = [
    {id: 1, name: "Headphones", price: 999, category: "Electronics", image: "https://www.boat-lifestyle.com/cdn/shop/files/Artboard2_b4d30e02-00f0-4b78-82c0-07440c4cc5f0_1800x.png?v=1752731162"},
    {id: 2, name: "Smart Watch", price: 1499, category: "Electronics", image: "https://rukminim2.flixcart.com/image/480/480/xif0q/smartwatch/n/o/z/-enriched-transparent-original-imah76jstup5zdww.png?q=90"},
    {id: 3, name: "T-Shirt", price: 499, category: "Clothing", image: "https://nobero.com/cdn/shop/files/White_26f7b17c-40c5-47b3-8532-c30f694e8bf7.jpg?v=1774953104"},
    {id: 4, name: "Shoes", price: 1299, category: "Clothing", image: "https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/a/d/ad22b92Nike-IB1873-001_1.jpg?rnd=20200526195200&tr=w-1536"},
    {id: 5, name: "Backpack", price: 799, category: "Accessories", image: "https://safaribags.com/cdn/shop/files/2_3d6acc65-50a9-4d45-b83c-31bb315d7b05_700x.jpg?v=1707731912"},
    {id: 6, name: "Sunglasses", price: 399, category: "Accessories", image: "https://www.woggles.in/api/cache/catalog/products/woggles_new_image_9_12_2022/luminary_grey_polarized_square_sunglasses_base_27_05_2024_700x700.jpg"}
];

let cart = [];

function displayProducts(list) {
    let output = "";

    list.forEach(function(product) {
        output += `
            <div class="product">
                <img src="${product.image}">
                <h3>${product.name}</h3>
                <p>Price: ₹${product.price}</p>
                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
                <button onclick="showDetails(${product.id})">
                    Details
                </button>
            </div>
        `;
    });

    document.getElementById("productList").innerHTML = output;
}

function addToCart(id) {
    let item = cart.find(function(p) {
        return p.id === id;
    });

    if (item) {
        item.quantity++;
    } else {
        let product = products.find(function(p) {
            return p.id === id;
        });

        cart.push({...product, quantity: 1});
    }

    updateCartCount();
    alert("Product added to cart!");
}

function updateCartCount() {
    let count = 0;

    cart.forEach(function(item) {
        count += item.quantity;
    });

    document.getElementById("cartCount").innerText = count;
}

function showCart() {
    document.getElementById("cartSection").style.display = "block";

    let output = "";
    let total = 0;

    cart.forEach(function(item) {
        output += `
            <div class="cartItem">
                ${item.name} - ₹${item.price}
                <br>
                Quantity: ${item.quantity}
                <button onclick="changeQuantity(${item.id}, 1)">+</button>
                <button onclick="changeQuantity(${item.id}, -1)">-</button>
                <button onclick="removeItem(${item.id})">Remove</button>
            </div>
        `;

        total += item.price * item.quantity;
    });

    document.getElementById("cartItems").innerHTML =
        output || "Your cart is empty";

    document.getElementById("total").innerText =
        "Total: ₹" + total;
}

function changeQuantity(id, amount) {
    let item = cart.find(function(p) {
        return p.id === id;
    });

    item.quantity += amount;

    if (item.quantity <= 0) {
        removeItem(id);
    }

    updateCartCount();
    showCart();
}

function removeItem(id) {
    cart = cart.filter(function(p) {
        return p.id !== id;
    });

    updateCartCount();
    showCart();
}

function filterProducts(category) {
    if (category === "All") {
        displayProducts(products);
    } else {
        let filtered = products.filter(function(p) {
            return p.category === category;
        });

        displayProducts(filtered);
    }
}

function searchProducts() {
    let value = document.getElementById("search").value.toLowerCase();

    let filtered = products.filter(function(p) {
        return p.name.toLowerCase().includes(value);
    });

    displayProducts(filtered);
}

function showDetails(id) {
    let product = products.find(function(p) {
        return p.id === id;
    });

    alert(
        "Product: " + product.name +
        "\nCategory: " + product.category +
        "\nPrice: ₹" + product.price
    );
}

function closeCart() {
    document.getElementById("cartSection").style.display = "none";
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    alert("Order placed successfully! (Demo Checkout)");

    cart = [];
    updateCartCount();
    showCart();
}

displayProducts(products);
