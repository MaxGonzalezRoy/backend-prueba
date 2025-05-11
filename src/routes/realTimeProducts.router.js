// src/routes/realTimeProducts.router.js
import { Router } from 'express';
import ProductManager from '../managers/productManager.js';

const router = Router();
const productManager = new ProductManager();

// Route to render the real-time products view
router.get('/', async (req, res) => {
    const products = await productManager.getAll();
    res.render('realTimeProducts', { products });
});

export default router;