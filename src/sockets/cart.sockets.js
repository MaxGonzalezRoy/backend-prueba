const CartService = require('../services/cart.service');

module.exports = (io) => {
    const cartService = new CartService();

    io.on('connection', (socket) => {
        console.log('🛒 Cliente conectado a carritos');

        // Agregar producto al carrito
        socket.on('cart:add-product', async ({ cartId, productId, quantity }) => {
            try {
                const updatedCart = await cartService.addProductToCart(cartId, productId, quantity);
                io.emit('cart:updated', updatedCart);
                socket.emit('notification', {
                    type: 'success',
                    message: 'Producto agregado al carrito'
                });
            } catch (error) {
                socket.emit('cart:error', {
                    message: error.message
                });
            }
        });

        // Eliminar producto del carrito
        socket.on('cart:remove-product', async ({ cartId, productId }) => {
            try {
                const updatedCart = await cartService.removeProductFromCart(cartId, productId);
                io.emit('cart:updated', updatedCart);
                socket.emit('notification', {
                    type: 'success',
                    message: 'Producto eliminado del carrito'
                });
            } catch (error) {
                socket.emit('cart:error', {
                    message: error.message
                });
            }
        });

        // Actualizar cantidad de producto
        socket.on('cart:update-quantity', async ({ cartId, productId, quantity }) => {
            try {
                const updatedCart = await cartService.updateProductQuantity(cartId, productId, quantity);
                io.emit('cart:updated', updatedCart);
                socket.emit('notification', {
                    type: 'success',
                    message: 'Cantidad actualizada'
                });
            } catch (error) {
                socket.emit('cart:error', {
                    message: error.message
                });
            }
        });
    });
};