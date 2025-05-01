const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');
const cartManager = new CartManager();

router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/cart/:cid', async (req, res) => {
    const cartId = req.params.cid;
    const cart = await cartManager.getCartById(cartId);
    res.render('cart', { cart });
});

router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const cid = parseInt(req.params.cid);
        const pid = parseInt(req.params.pid);

        const cart = await cartManager.getCartById(cid);
        const updatedProducts = cart.products.filter(p => p.product !== pid);

        const allCarts = await cartManager.getCarts();
        const cartIndex = allCarts.findIndex(c => c.id === cid);
        allCarts[cartIndex].products = updatedProducts;

        await fs.writeFile(cartManager.path, JSON.stringify(allCarts, null, 2));

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cid = parseInt(req.params.cid);
        const pid = parseInt(req.params.pid);
        const quantity = parseInt(req.body.quantity) || 1;

        if (isNaN(cid) || isNaN(pid)) {
            return res.status(400).json({ error: "ID del carrito y del producto deben ser números válidos" });
        }

        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ error: "La cantidad debe ser un número positivo" });
        }
        
        const updatedCart = await cartManager.addProductToCart(cid, pid, quantity);
        if (!updatedCart) {
            return res.status(404).json({ error: "No se pudo actualizar el carrito. Verifique los IDs proporcionados." });
        }

        res.json(updatedCart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;