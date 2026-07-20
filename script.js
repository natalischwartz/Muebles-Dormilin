const productsUL = document.getElementById("productsUL");
const cartCount = document.getElementById("cartCount");
const cartItemsList = document.getElementById("cartItemsList");
const cartTotal = document.getElementById("cartTotal");
const sendWhatsappBtn = document.getElementById("sendWhatsappBtn");
const emptyCartBtn = document.getElementById("emptyCartBtn");

// NOTA: Agregar código de país sin el '+' ni espacios (ej: 549 para Argentina)
const PHONE_NUMBER = "5491132778004"; 

// Obtener carrito de LocalStorage o inicializarlo vacío
let cart = JSON.parse(localStorage.getItem("dormilin_cart")) || [];

// 1. Cargar productos desde JSON
async function loadProducts() {
    try {
        const res = await fetch('products.json');
        const products = await res.json();
        
        // Llamamos directamente a la función que renderiza las cards
        renderProducts(products); 
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
}

// 2. Renderizar Cards en el HTML
function renderProducts(products) {
    productsUL.innerHTML = "";
    products.forEach((p, index) => {
        productsUL.innerHTML += `
        <div class="col-12 col-md-6 col-lg-4 mb-4"> 
            <div class="card h-100 shadow-sm"> 
                <img src="${p.img}" class="card-img-top object-fit-cover" style="height: 200px;" alt="${p.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${p.name}</h5>
                    <p class="card-text text-muted">${p.description}</p>
                    <div class="mt-auto"> 
                        <h6 class="text-primary fw-bold fs-5">$${p.price.toLocaleString()}</h6>
                        
                        <!-- REDIRECCIÓN A LA PÁGINA DE DETALLE -->
                        <a href="product.html?id=${p.id}" class="btn btn-primary w-100 mt-2">
                            <i class="fa-solid fa-eye me-1"></i> Ver Producto
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
    });
}

// 3. Agregar producto al carrito
function addToCart(name, price) {
    const existingIndex = cart.findIndex(item => item.name === name);
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    
    saveAndUpdateCart();
}

// 4. Cambiar cantidad de un producto (+ / -)
function changeQuantity(index, amount) {
    cart[index].quantity += amount;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1); // Si la cantidad llega a 0, se elimina
    }
    saveAndUpdateCart();
}

// 5. Guardar en localStorage y actualizar la vista del carrito
function saveAndUpdateCart() {
    localStorage.setItem("dormilin_cart", JSON.stringify(cart));
    updateCartUI();
}

// 6. Actualizar Modal y Contador
function updateCartUI() {
    // Actualizar Badge del contador
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Renderizar la lista del modal
    cartItemsList.innerHTML = "";
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = `<li class="list-group-item text-center text-muted">El carrito está vacío.</li>`;
        cartTotal.textContent = "$0";
        sendWhatsappBtn.classList.add("disabled");
        sendWhatsappBtn.href = "#";
        return;
    }

    let totalMoney = 0;
    let whatsappMessage = "¡Hola *Muebles Dormilin*! 👋 Quisiera realizar el siguiente pedido:\n\n";

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        totalMoney += subtotal;

        // Añadir a la lista HTML
        cartItemsList.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>
                <h6 class="my-0">${item.name}</h6>
                <small class="text-muted">$${item.price.toLocaleString()} x ${item.quantity}</small>
            </div>
            <div class="d-flex align-items-center gap-2">
                <span class="fw-bold me-2">$${subtotal.toLocaleString()}</span>
                <button class="btn btn-sm btn-outline-secondary px-2" onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="btn btn-sm btn-outline-secondary px-2" onclick="changeQuantity(${index}, 1)">+</button>
            </div>
        </li>`;

        // Construir mensaje de WhatsApp
        whatsappMessage += `• *${item.name}* (x${item.quantity}) - $${subtotal.toLocaleString()}\n`;
    });

    whatsappMessage += `\n*Total estimado:* $${totalMoney.toLocaleString()}\n`;
    whatsappMessage += `\nQuedo a la espera para *confirmar stock y coordinar la entrega*. ¡Muchas gracias!`;

    // Actualizar total e hipervínculo de WhatsApp
    cartTotal.textContent = `$${totalMoney.toLocaleString()}`;
    sendWhatsappBtn.classList.remove("disabled");
    sendWhatsappBtn.href = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
}

// 7. Vaciar Carrito
emptyCartBtn.addEventListener("click", () => {
    cart = [];
    saveAndUpdateCart();
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    updateCartUI(); // Carga el estado guardado del carrito si existe
});