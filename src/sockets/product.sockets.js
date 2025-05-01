const ProductService = require('../services/product.service');

module.exports = (io) => {
    const productService = new ProductService();
    
    io.on('connection', (socket) => {
        console.log('🟢 Cliente conectado a productos');
        
        socket.on('product:create', async (productData) => {
            try {
                const product = await productService.createProduct(productData);
                io.emit('product:created', product);
            } catch (error) {
                socket.emit('product:error', error.message);
            }
        });
        
        // ... (otros eventos)
    });
};