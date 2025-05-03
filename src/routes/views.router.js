import { Router } from 'express';
import ProductManager from '../managers/productManager.js';
import CartManager from '../managers/cartManager.js';

const router = Router();
const productManager = new ProductManager();
const cartManagerInstance = new CartManager();  // Renombrado la instancia para evitar conflicto

// GET /home - Renderiza lista de productos (vista estática)
router.get('/home', async (req, res) => {
    const products = await productManager.getAll();
    res.render('home', { products });
});

// GET /realtimeproducts - Renderiza vista con WebSockets
router.get('/realtimeproducts', async (req, res) => {
    const products = await productManager.getAll();
    res.render('realtimeproducts', {
        title: 'Productos en Tiempo Real',
        year: new Date().getFullYear(),
        products
    });
});

router.get('/cart', async (req, res) => {
    res.render('carts', {
        title: 'Tu carrito',
        year: new Date().getFullYear()
    });
});

// Redirige raíz a /home
router.get('/', (req, res) => {
    res.redirect('/home');
});

export default router;