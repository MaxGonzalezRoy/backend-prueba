// src/routes/realTimeProducts.router.js
import { Router } from 'express';
import ProductManager from '../dao/fileManagers/product.Manager';

const router = Router();
const productManager = new ProductManager();

// Route to render the real-time products view
router.get('/', async (req, res) => {
    const products = await productManager.getProducts();
    res.render('realTimeProducts', { products });
});

export default router;