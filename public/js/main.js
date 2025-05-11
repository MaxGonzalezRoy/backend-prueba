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

// Delegación de eventos y renderizado correcto
socket.on('update-products', (products) => {
    const container = document.getElementById('product-list');
    container.innerHTML = '';

    products.forEach(prod => {
        container.innerHTML += `
            <div class="bg-white shadow-md rounded-lg p-4 mb-4">
                <h2 class="text-xl font-semibold">${prod.title}</h2>
                <p>Precio: $${prod.price}</p>
                <div class="mt-2 flex gap-2">
                    <button data-id="${prod._id}" class="delete-btn bg-red-500 text-white px-3 py-1 rounded">Eliminar</button>
                    <button data-id="${prod._id}" class="add-cart-btn bg-green-500 text-white px-3 py-1 rounded">Agregar al carrito</button>
                </div>
            </div>
        `;
    });

    // Asignar eventos a botones después de renderizar
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            socket.emit('delete-product', id);
        });
    });

    const addButtons = document.querySelectorAll('.add-cart-btn');
    addButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const productId = btn.getAttribute('data-id');
            const cartId = 1; // o el id dinámico que estés usando

            try {
                const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
                    method: 'POST'
                });

                if (response.ok) {
                    alert('Producto agregado al carrito');
                } else {
                    alert('Error al agregar al carrito');
                }
            } catch (err) {
                console.error('Error:', err);
            }
        });
    });
});