const socket = io();
console.log("🟢 Socket conectado");

const productList = document.getElementById('product-list');
const editForm = document.getElementById('edit-form');
let editingId = null;

// Configuración común para SweetAlert
const showToast = (msg, icon = 'success') => {
    Swal.fire({ toast: true, icon, title: msg, timer: 2000, position: 'top-end' });
};

// Renderizado de productos con botón para carrito
socket.on('products', products => {
    productList.innerHTML = '';
    products.forEach(p => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <strong>${p.title}</strong> - $${p.price} <br>
            <em>${p.description}</em><br>
            <small>Categoría: ${p.category} | Stock: ${p.stock}</small><br>
            <div class="product-actions">
                <button class="delete-btn" data-id="${p.id}">🗑️ Eliminar</button>
                <button class="edit-btn" data-id="${p.id}">✏️ Editar</button>
                <button class="add-cart-btn" data-id="${p.id}">🛒 Agregar</button>
            </div>
        `;
        productList.appendChild(productCard);
    });

    // Asignar eventos después de renderizar
    assignProductEvents();
});

// Manejo de eventos
function assignProductEvents() {
    // Eliminar producto
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            deleteProduct(productId);
        });
    });

    // Editar producto
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            const product = getProductById(productId); // Necesitarías implementar esta función
            editProduct(product);
        });
    });

    // Agregar al carrito
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = e.target.dataset.id;
            try {
                const response = await fetch(`/api/carts/1/product/${productId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: 1 })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Error al agregar al carrito');
                }
                
                showToast('Producto agregado al carrito');
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: error.message });
            }
        });
    });
}

// Formulario para agregar producto
document.getElementById('add-form').addEventListener('submit', e => {
    e.preventDefault();
    const newProduct = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: Number(document.getElementById('price').value),
        stock: Number(document.getElementById('stock').value),
        category: document.getElementById('category').value,
        thumbnails: [document.getElementById('thumbnails').value],
    };
    socket.emit('new-product', newProduct);
    e.target.reset();
});

// Funciones para edición
function editProduct(product) {
    editingId = product.id;
    editForm.style.display = 'block';
    document.getElementById('edit-title').value = product.title;
    document.getElementById('edit-description').value = product.description;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-stock').value = product.stock;
    document.getElementById('edit-category').value = product.category;
    document.getElementById('edit-thumbnails').value = product.thumbnails?.[0] || '';
}

document.getElementById('save-edit').addEventListener('click', () => {
    const updatedProduct = {
        id: editingId,
        title: document.getElementById('edit-title').value,
        description: document.getElementById('edit-description').value,
        price: Number(document.getElementById('edit-price').value),
        stock: Number(document.getElementById('edit-stock').value),
        category: document.getElementById('edit-category').value,
        thumbnails: [document.getElementById('edit-thumbnails').value],
    };
    socket.emit('update-product', updatedProduct);
    editForm.style.display = 'none';
});

// Función para eliminar producto
function deleteProduct(id) {
    socket.emit('delete-product', id);
}

// Manejo de notificaciones
socket.on('toast', showToast);
socket.on('error', msg => {
    Swal.fire({ icon: 'error', title: 'Error', text: msg });
})