let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Add item
function addToCart(name, price) {
    cart.push({ name, price });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(name + " added!");
}

// Show items in cart
function showCart() {
    let box = document.getElementById("cart-items");
    if (!box) return;

    let total = 0;
    box.innerHTML = "";

    cart.forEach((item, index) => {
        box.innerHTML += `
                ${item.name} - $${item.price}
                <button onclick="removeFromCart(${index})">Remove</button>
            </p>
        `;
        total += item.price;
    });

    document.getElementById("total").innerText = "Total: $" + total;
}

// Remove item
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    showCart();
}

showCart();
