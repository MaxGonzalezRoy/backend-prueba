import { Router } from 'express';
import ProductManager from '../managers/productManager.js';

const router = Router();
const productManager = new ProductManager();

// GET /home - Renderiza lista de productos (vista estática)
router.get('/home', async (req, res) => {
    const products = await productManager.getAll();
    res.render('home', { products });
});

// GET /realtimeproducts - Renderiza vista con WebSockets
router.get('/realtimeproducts', async (req, res) => {
    const products = await productManager.getAll();
    res.render('realTimeProducts', { products });
});

export default router;
