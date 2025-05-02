import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();
const cartManager = new CartManager();

// POST /api/carts - Crear nuevo carrito
router.post('/', async (req, res) => {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
});

// GET /api/carts/:cid - Obtener productos de un carrito
router.get('/:cid', async (req, res) => {
    const cid = parseInt(req.params.cid);
    const cart = await cartManager.getCartById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart.products);
});

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);
    const updatedCart = await cartManager.addProductToCart(cid, pid);
    if (!updatedCart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(updatedCart);
});

export default router;
