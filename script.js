const productsUL = document.getElementById("productsUL");

async function loadProducts() {
    try {
         const res = await fetch('products.json')
        const products = await res.json();
        console.log(products)
        products.forEach((p)=>{
            productsUL.innerHTML +=
            //card de products 
        `<div class="col-md-4 mb-4 container_card"> 
        <div class="card h-100 shadow-sm"> 
            <img src="${p.img}" class="card-img-top" alt="${p.name}">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${p.name}</h5>
                <p class="card-text text-muted">${p.description}</p>
                <div class="mt-auto"> 
                    <h6 class="text-primary fw-bold fs-5">$${p.price.toLocaleString()}</h6>
                    <a href="#" class="btn btn-primary w-100 mt-2">Comprar</a>
                </div>
            </div>
        </div>
    </div>`
    })
        
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
   
}

document.addEventListener("DOMContentLoaded", ()=>{
    loadProducts();
})