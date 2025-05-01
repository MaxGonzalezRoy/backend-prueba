const express = require('express');
const router = express.Router();
const ProductService = require('../services/product.service');
const CartService = require('../services/cart.service');
const productService = new ProductService();
const cartService = new CartService();

// Vista de inicio
router.get('/', async (req, res) => {
    try {
        const products = await productService.getAllProducts({ limit: 10 });
        res.render('home', { 
            title: 'Inicio',
            products: products.data,
            scripts: ['home']
        });
    } catch (error) {
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error al cargar los productos'
        });
    }
});

// Vista de productos
router.get('/products', async (req, res) => {
    try {
        const products = await productService.getAllProducts(req.query);
        res.render('products', {
            title: 'Productos',
            products: products.data,
            scripts: ['products']
        });
    } catch (error) {
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error al cargar los productos'
        });
    }
});

// Vista del carrito
router.get('/cart', async (req, res) => {
    try {
        // Usar cartId del usuario cuando implementemos autenticación
        const cartId = 1; // Temporal - hardcodeado
        const cart = await cartService.getCartById(cartId);
        
        res.render('cart', {
            title: 'Carrito',
            cart,
            scripts: ['cart']
        });
    } catch (error) {
        res.status(500).render('error', {
            title: 'Error',
            message: 'Error al cargar el carrito'
        });
    }
});

// Vista de contacto
router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contacto'
    });
});

module.exports = router;