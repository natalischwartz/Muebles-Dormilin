const productDetailContainer = document.getElementById("productDetailContainer");
const cartCount = document.getElementById("cartCount");
const cartItemsList = document.getElementById("cartItemsList");
const cartTotal = document.getElementById("cartTotal");
const sendWhatsappBtn = document.getElementById("sendWhatsappBtn");
const emptyCartBtn = document.getElementById("emptyCartBtn");

const PHONE_NUMBER = "5491112345678"; 
let cart = JSON.parse(localStorage.getItem("dormilin_cart")) || [];

// 1. Obtener ID de la URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// 2. Cargar Producto
async function loadProductDetail() {
    try {
        const res = await fetch('products.json');
        const products = await res.json();
        
        // BUSCA EL PRODUCTO POR SU CAMPO "id" (en formato string/texto)
        const product = products.find(p => String(p.id) === String(productId));

        if (!product) {
            productDetailContainer.innerHTML = `<h2>Producto no encontrado</h2>`;
            return;
        }

        renderDetail(product);
    } catch (error) {
        console.error("Error al cargar detalle:", error);
    }
}

// 3. Renderizar Detalle
function renderDetail(p) {
    productDetailContainer.innerHTML = `
        <div class="col-md-6 text-center">
            <img src="${p.img}" class="img-fluid rounded shadow" style="max-height: 400px; width: 100%; object-fit: cover;" alt="${p.name}">
        </div>
        <div class="col-md-6">
            <h1 class="display-5 fw-bold">${p.name}</h1>
            <p class="fs-4 text-primary fw-bold">$${p.price.toLocaleString()}</p>
            <p class="lead text-muted">${p.description}</p>
            
            <div class="d-flex align-items-center gap-3 my-4">
                <label for="quantityInput" class="fw-bold">Cantidad:</label>
                <input type="number" id="quantityInput" class="form-control text-center" value="1" min="1" style="width: 80px;">
            </div>

            <button id="addToCartBtn" class="btn btn-success btn-lg w-100">
                <i class="fa-solid fa-cart-plus me-2"></i>Agregar al Carrito
            </button>
        </div>
    `;

    // Listener para agregar cantidad personalizada al carrito
    document.getElementById("addToCartBtn").addEventListener("click", () => {
        const qty = parseInt(document.getElementById("quantityInput").value) || 1;
        addToCartCustomQty(p.name, p.price, qty);
    });
}

// 4. Agregar al carrito con cantidad personalizada
function addToCartCustomQty(name, price, quantity) {
    const existingIndex = cart.findIndex(item => item.name === name);
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({ name, price, quantity });
    }
    
    saveAndUpdateCart();

    // Abrir el modal del carrito automáticamente tras agregar
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    cartModal.show();
}

// Lógica de Carrito Compartida
function changeQuantity(index, amount) {
    cart[index].quantity += amount;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    saveAndUpdateCart();
}

function saveAndUpdateCart() {
    localStorage.setItem("dormilin_cart", JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartItemsList.innerHTML = "";
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = `<li class="list-group-item text-center text-muted">El carrito está vacío.</li>`;
        cartTotal.textContent = "$0";
        sendWhatsappBtn.classList.add("disabled");
        return;
    }

    let totalMoney = 0;
    let whatsappMessage = "¡Hola *Muebles Dormilin*! 👋 Quisiera realizar el siguiente pedido:\n\n";

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        totalMoney += subtotal;

        cartItemsList.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <h6 class="my-0">${item.name}</h6>
                <small class="text-muted">$${item.price.toLocaleString()} x ${item.quantity}</small>
            </div>
            <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-secondary px-2" onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="btn btn-sm btn-outline-secondary px-2" onclick="changeQuantity(${index}, 1)">+</button>
            </div>
        </li>`;

        whatsappMessage += `• *${item.name}* (x${item.quantity}) - $${subtotal.toLocaleString()}\n`;
    });

    whatsappMessage += `\n*Total estimado:* $${totalMoney.toLocaleString()}\n\nQuedo a la espera para *confirmar stock*.`;

    cartTotal.textContent = `$${totalMoney.toLocaleString()}`;
    sendWhatsappBtn.classList.remove("disabled");
    sendWhatsappBtn.href = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
}

emptyCartBtn.addEventListener("click", () => {
    cart = [];
    saveAndUpdateCart();
});

// Evitar advertencia aria-hidden
document.getElementById('cartModal').addEventListener('hide.bs.modal', () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    loadProductDetail();
    updateCartUI();
});