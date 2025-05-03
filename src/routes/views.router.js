import { Router } from 'express';
import ProductManager from '../managers/productManager.js';
import CartManager from '../managers/cartManager.js';

const router = Router();
const productManager = new ProductManager();
const cartManagerInstance = new CartManager();  // Renombrado la instancia para evitar conflicto

// GET /home - Renderiza lista de productos (vista estática)
router.get('/home', async (req, res) => {
    const products = await productManager.getAll();
    res.render('home', { 
        title: 'Inicio',
        year: new Date().getFullYear(),
        products 
    });
});

// GET /products - Vista con WebSockets
router.get('/products', async (req, res) => {
    const products = await productManager.getAll();
    res.render('products', {
        title: 'Productos',
        year: new Date().getFullYear(),
        products
    });
});

// GET /cart - Carrito
router.get('/cart', async (req, res) => {
    res.render('carts', {
        title: 'Tu carrito',
        year: new Date().getFullYear()
    });
});

router.get('/realtimeproducts', async (req, res) => {
    console.log('🛠 Entrando a /realtimeproducts');
    const products = await productManager.getAll();
    res.render('realTimeProducts', {
        title: 'Productos en Tiempo Real',
        year: new Date().getFullYear(),
        products
    });
});

// Redirige raíz a /home
router.get('/', (req, res) => {
    res.redirect('/home');
});

export default router;