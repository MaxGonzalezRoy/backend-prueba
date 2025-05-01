const socket = io();
console.log("🟢 Socket conectado");

const productList = document.getElementById('product-list');
const editForm = document.getElementById('edit-form');
let editingId = null;

socket.on('products', products => {
    productList.innerHTML = '';
    products.forEach(p => {
        const li = document.createElement('li');
        li.className = 'product-card';
        li.innerHTML = `
        <strong>${p.title}</strong> - $${p.price} <br>
        <em>${p.description}</em><br>
        <small>Categoría: ${p.category} | Stock: ${p.stock}</small><br>
        <button onclick="deleteProduct(${p.id})">🗑️ Eliminar</button>
        <button onclick='editProduct(${JSON.stringify(p)})'>✏️ Editar</button>
        `;
        productList.appendChild(li);
    });
});

socket.on('toast', msg => {
    Swal.fire({ toast: true, icon: 'success', title: msg, timer: 2000, position: 'top-end' });
});

socket.on('error', msg => {
    Swal.fire({ icon: 'error', title: 'Error', text: msg });
});

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

window.deleteProduct = id => {
    socket.emit('delete-product', id);
};

window.editProduct = product => {
    editingId = product.id;
    editForm.style.display = 'block';
    document.getElementById('edit-title').value = product.title;
    document.getElementById('edit-description').value = product.description;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-stock').value = product.stock;
    document.getElementById('edit-category').value = product.category;
    document.getElementById('edit-thumbnails').value = product.thumbnails?.[0] || '';
};

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
