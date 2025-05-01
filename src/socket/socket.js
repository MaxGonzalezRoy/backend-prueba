module.exports = (io, productManager, cartManager) => {
    io.on('connection', async (socket) => {
        console.log('🟢 Nuevo cliente conectado');

        // Función para emitir productos actualizados
        const sendUpdatedProducts = async (toastMessage = null) => {
            try {
                const products = await productManager.getProducts();
                io.emit('products', products);
                if (toastMessage) socket.emit('toast', toastMessage);
            } catch (error) {
                socket.emit('error', error.message);
            }
        };

        // Enviar productos iniciales al conectar
        try {
            const products = await productManager.getProducts();
            socket.emit('products', products);
        } catch (error) {
            console.error('Error al obtener productos:', error);
        }

        // Crear nuevo producto
        socket.on('new-product', async (data) => {
            try {
                await productManager.addProduct(data);
                await sendUpdatedProducts('✅ Producto agregado con éxito');
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Eliminar producto
        socket.on('delete-product', async (id) => {
            try {
                await productManager.deleteProduct(id);
                await sendUpdatedProducts('🗑️ Producto eliminado correctamente');
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Actualizar producto
        socket.on('update-product', async (updatedProduct) => {
            try {
                await productManager.updateProduct(updatedProduct.id, updatedProduct);
                await sendUpdatedProducts('✅ Producto actualizado con éxito');
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // Agregar al carrito
        socket.on('add-to-cart', async ({ productId, quantity }) => {
            try {
                const cartId = 'test-cart-id'; // Reemplazar por ID dinámico en el futuro
                await cartManager.addProductToCart(cartId, productId, quantity);
                const updatedCart = await cartManager.getCartById(cartId);
                socket.emit('cart-updated', updatedCart);
            } catch (error) {
                socket.emit('error', error.message);
            }
        });
    });
};
