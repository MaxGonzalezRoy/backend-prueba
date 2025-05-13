const socket = window.socket || io();
window.socket = socket;

// 🔄 Recarga automática de vista si se actualiza la lista de productos
socket.on('productListUpdated', () => {
    location.reload();
});

// 🧠 Función reutilizable para asignar eventos a botones de productos
function bindProductButtons() {
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

            // ⚠️ Reemplazar con un cartId dinámico si es necesario
            const cartId = 1;

            try {
                const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
                    method: 'POST'
                });

                if (response.ok) {
                    socket.emit('cart-modified', cartId);
                    Swal.fire({
                        title: 'Agregado',
                        text: 'Producto agregado al carrito.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire('Error', 'No se pudo agregar el producto al carrito.', 'error');
                }
            } catch (err) {
                console.error('Error:', err);
                Swal.fire('Error', 'Error inesperado al agregar al carrito.', 'error');
            }
        });
    });
}

// 🔁 Renderizado en tiempo real de productos
socket.on('update-products', (products) => {
    const container = document.getElementById('product-list');
    if (!container) return;

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

    // 🧠 Asignar eventos después del renderizado
    bindProductButtons();
});

// 📝 Evento para nuevo producto desde el formulario
const form = document.getElementById('product-form');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!form.title.value || !form.description.value || !form.category.value || !form.price.value) {
            Swal.fire('Campos incompletos', 'Por favor, completa todos los campos.', 'warning');
            return;
        }

        const newProduct = {
            title: form.title.value,
            description: form.description.value,
            category: form.category.value,
            price: parseFloat(form.price.value)
        };

        socket.emit('new-product', newProduct);
        form.reset();

        Swal.fire({
            title: 'Enviado',
            text: 'Producto enviado correctamente.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    });
} else {
    console.log('🧾 Formulario de producto no encontrado.');
}

// 🔁 Escuchar eventos relacionados con carritos
socket.on('cartUpdated', (cart) => {
    console.log('🛒 Carrito actualizado:', cart);
    location.reload();
});

socket.on('cartListUpdated', (carts) => {
    console.log('📋 Lista de carritos actualizada:', carts);
    location.reload();
});