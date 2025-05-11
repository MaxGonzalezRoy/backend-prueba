const socket = io();

const form = document.getElementById('product-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newProduct = {
        title: form.title.value,
        description: form.description.value,
        category: form.category.value,
        price: parseFloat(form.price.value)
    };
    socket.emit('new-product', newProduct);
    form.reset();
});

socket.on('update-products', (products) => {
    const container = document.getElementById('product-list');
    container.innerHTML = '';
    products.forEach(prod => {
        container.innerHTML += `
        <div class="bg-white shadow-md rounded-lg p-4">
            <h2 class="text-xl font-semibold">${prod.title}</h2>
            <p>Precio: $${prod.price}</p>
            <button onclick="deleteProduct('${prod.id}')" class="bg-red-500 text-white px-3 py-1 rounded mt-2">Eliminar</button>
        </div>
        `;
    });
});

function deleteProduct(id) {
    socket.emit('delete-product', id);
}
