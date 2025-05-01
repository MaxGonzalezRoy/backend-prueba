const socket = io();
const cartId = localStorage.getItem('cartId') || 'default-cart'; // Usar un valor por defecto o implementar creación de carrito

/**
 * Agrega un producto al carrito con manejo de errores mejorado
 * @param {string} productId - ID del producto a agregar
 * @param {number} [quantity=1] - Cantidad a agregar (opcional)
 */
window.addToCart = async (productId, quantity = 1) => {
    try {
        if (!productId) {
            throw new Error('ID de producto no válido');
        }

        // Mostrar feedback inmediato al usuario
        const toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
        
        toast.fire({
            icon: 'info',
            title: 'Agregando al carrito...'
        });

        // Emitir evento al servidor
        socket.emit('add-to-cart', { 
            cartId, 
            productId, 
            quantity,
            timestamp: new Date().toISOString() 
        });

    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        showError('Error al agregar producto', error.message);
    }
};

/**
 * Muestra un mensaje de error estilizado
 * @param {string} title - Título del error
 * @param {string} message - Mensaje detallado
 */
function showError(title, message) {
    Swal.fire({
        icon: 'error',
        title,
        text: message,
        confirmButtonText: 'Entendido',
        customClass: {
            confirmButton: 'btn btn-error'
        }
    });
}

// Escuchar actualizaciones del carrito
socket.on('cart-updated', (cart) => {
    console.log('🛒 Carrito actualizado:', cart);
    
    // Actualizar UI del carrito
    updateCartUI(cart);
    
    // Mostrar notificación
    Swal.fire({
        icon: 'success',
        title: 'Carrito actualizado',
        text: `Ahora tienes ${cart.products.length} productos en tu carrito`,
        toast: true,
        position: 'top-end',
        timer: 3000,
        timerProgressBar: true
    });
});

// Manejo de errores del servidor
socket.on('cart-error', (error) => {
    console.error('Error en el carrito:', error);
    showError('Error en el carrito', error.message || 'Ocurrió un error');
});

/**
 * Actualiza la interfaz de usuario del carrito
 * @param {object} cart - Objeto del carrito
 */
function updateCartUI(cart) {
    // Implementar lógica para actualizar el contador del carrito en la UI
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        const totalItems = cart.products.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
        cartCounter.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
    
    // Si estamos en la página del carrito, actualizar la lista completa
    if (window.location.pathname.includes('cart')) {
        renderFullCart(cart);
    }
}

/**
 * Renderiza el carrito completo (para la página del carrito)
 * @param {object} cart - Objeto del carrito
 */
function renderFullCart(cart) {
    // Implementar lógica para renderizar todos los productos del carrito
    const cartContainer = document.getElementById('cart-items');
    if (cartContainer) {
        cartContainer.innerHTML = cart.products.map(item => `
            <div class="cart-item">
                <h4>${item.productDetails?.title || 'Producto'}</h4>
                <p>Cantidad: ${item.quantity}</p>
                <p>Precio unitario: $${item.productDetails?.price || 0}</p>
                <button onclick="updateCartItem('${item.product}', ${item.quantity - 1})">-</button>
                <button onclick="updateCartItem('${item.product}', ${item.quantity + 1})">+</button>
                <button onclick="removeFromCart('${item.product}')">Eliminar</button>
            </div>
        `).join('');
    }
}

// Funciones adicionales para manejar el carrito
window.updateCartItem = (productId, newQuantity) => {
    if (newQuantity <= 0) {
        removeFromCart(productId);
    } else {
        socket.emit('update-cart-item', { cartId, productId, quantity: newQuantity });
    }
};

window.removeFromCart = (productId) => {
    socket.emit('remove-from-cart', { cartId, productId });
};