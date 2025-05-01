const express = require('express');
const CartManager = require('../managers/CartManager');
const ProductManager = require('../managers/ProductManager');
const router = express.Router();
const cartManager = new CartManager();
const productManager = new ProductManager();

// Middleware para validar IDs
const validateIds = (req, res, next) => {
    const { cid, pid } = req.params;
    
    if (isNaN(cid)) {
        return res.status(400).json({ error: 'Cart ID must be a number' });
    }
    
    if (pid && isNaN(pid)) {
        return res.status(400).json({ error: 'Product ID must be a number' });
    }
    
    next();
};

// Crear nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json({
            success: true,
            message: 'Cart created successfully',
            cart: newCart
        });
    } catch (error) {
        console.error('Error creating cart:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// Obtener carrito por ID
router.get('/:cid', validateIds, async (req, res) => {
    try {
        const cart = await cartManager.getCartById(req.params.cid);
        
        // Enriquecer los productos con información detallada
        const enrichedProducts = await Promise.all(
            cart.products.map(async item => {
                const product = await productManager.getProductById(item.product);
                return {
                    ...item,
                    productDetails: {
                        title: product.title,
                        description: product.description,
                        price: product.price,
                        thumbnails: product.thumbnails
                    }
                };
            })
        );
        
        res.json({
            success: true,
            cart: {
                ...cart,
                products: enrichedProducts
            }
        });
    } catch (error) {
        const status = error.message.includes('not found') ? 404 : 500;
        res.status(status).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Agregar producto al carrito
router.post('/:cid/product/:pid', validateIds, async (req, res) => {
    try {
        const { cid, pid } = req.params;
        let { quantity } = req.body;
        
        // Validar y normalizar cantidad
        quantity = parseInt(quantity) || 1;
        if (quantity <= 0) {
            return res.status(400).json({ 
                success: false,
                error: 'Quantity must be greater than 0' 
            });
        }
        
        // Verificar existencia del producto
        await productManager.getProductById(pid);
        
        const updatedCart = await cartManager.addProductToCart(cid, pid, quantity);
        
        res.json({
            success: true,
            message: 'Product added to cart successfully',
            cart: updatedCart
        });
    } catch (error) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Actualizar cantidad de producto en carrito
router.put('/:cid/product/:pid', validateIds, async (req, res) => {
    try {
        const { quantity } = req.body;
        const quantityNumber = Number(quantity);
        
        if (isNaN(quantityNumber)) {
            throw new Error('Quantity must be a number');
        }
        
        if (quantityNumber <= 0) {
            throw new Error('Quantity must be greater than 0');
        }

        const updatedCart = await cartManager.updateProductQuantity(
            req.params.cid,
            req.params.pid,
            quantityNumber
        );
        
        res.json({
            success: true,
            message: 'Product quantity updated successfully',
            cart: updatedCart
        });
    } catch (error) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Eliminar producto del carrito
router.delete('/:cid/product/:pid', validateIds, async (req, res) => {
    try {
        const updatedCart = await cartManager.removeProductFromCart(
            req.params.cid,
            req.params.pid
        );
        
        res.json({
            success: true,
            message: 'Product removed from cart successfully',
            cart: updatedCart
        });
    } catch (error) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Vaciar carrito
router.delete('/:cid', validateIds, async (req, res) => {
    try {
        const result = await cartManager.clearCart(req.params.cid);
        res.json({
            success: true,
            message: 'Cart cleared successfully',
            ...result
        });
    } catch (error) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ 
            success: false,
            error: error.message 
        });
    }
});

module.exports = router;