import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();
const cartManagerInstance = new CartManager();  // Renombrado la instancia

// POST /api/carts - Crear nuevo carrito
router.post('/', async (req, res) => {
    const newCart = await cartManagerInstance.createCart();
    res.status(201).json(newCart);
});

// GET /api/carts/:cid - Obtener productos de un carrito
router.get('/:cid', async (req, res) => {
    const cid = parseInt(req.params.cid);
    const cart = await cartManagerInstance.getCartById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart.products);
});

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await cartManager.addProductToCart(cid, pid);
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;