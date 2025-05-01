const socket = io();

window.addToCart = (productId) => {
    const cartId = localStorage.getItem('cartId'); // Esto deberías haberlo guardado cuando se creó el carrito
    if (!cartId) {
        alert("❌ No hay carrito activo. Creá uno primero.");
        return;
    }

    socket.emit('add-to-cart', { cartId, productId, quantity: 1 });
};

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

socket.on('error', msg => {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg
    });
});
