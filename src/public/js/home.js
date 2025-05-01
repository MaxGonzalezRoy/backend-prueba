const socket = io();

// Función para agregar un producto al carrito
window.addToCart = (productId) => {
    const cartId = localStorage.getItem('cartId'); // Asegúrate de que este ID esté guardado cuando se cree el carrito
    if (!cartId) {
        alert("❌ No hay carrito activo. Creá uno primero.");
        return;
    }

    Swal.fire({
        title: '¿Cuántos deseas agregar?',
        input: 'number',
        inputValue: 1,
        showCancelButton: true,
        confirmButtonText: 'Agregar al carrito',
    }).then(result => {
        if (result.isConfirmed) {
            const quantity = result.value || 1;  // Se asegura de que la cantidad sea un número positivo
            socket.emit('add-to-cart', { cartId, productId, quantity });
        }
    });
};

// Escuchar evento de carrito actualizado
socket.on('cart-updated', cart => {
    console.log("✅ Carrito actualizado:", cart);
    Swal.fire({
        icon: 'success',
        title: 'Producto agregado al carrito',
        toast: true,
        timer: 2000,
        position: 'top-end'
    });
});

// Escuchar errores
socket.on('error', msg => {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg
    });
});