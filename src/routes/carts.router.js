import { Router } from 'express';
import CartManager from '../managers/cartManager.js';
const router = Router();

const cartMgr = new CartManager();

// POST /api/carts
router.post('/', async (req, res) => {
    try {
        const newCart = await cartMgr.createCart();

        const io = req.app.get('socketio');
        const allCarts = await cartMgr.getAllCarts(); // función que deberías agregar
        io.emit('cartListUpdated', allCarts);

        res.status(201).json({ message: 'Carrito creado', cart: newCart });
    } catch (error) {
        console.error('Error al crear el carrito:', error);
        res.status(500).json({ error: 'Error al crear el carrito' });
    }
});

// GET /api/carts/:cid
router.get('/:cid', async (req, res) => {
    try {
        const cart = await cartMgr.getCartById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
        res.json(cart);
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
});

// PUT /api/carts/:cid/products/:pid
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ error: 'La cantidad debe ser mayor a cero' });
        }

        const updatedCart = await cartMgr.updateProductQuantity(req.params.cid, req.params.pid, quantity);
        if (!updatedCart) return res.status(404).json({ error: 'Producto o carrito no encontrado' });

        const io = req.app.get('socketio');
        io.emit('cartUpdated', updatedCart);

        res.json({ message: 'Cantidad actualizada', cart: updatedCart });
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// DELETE /api/carts/:cid/products/:pid
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const updatedCart = await cartMgr.removeProduct(req.params.cid, req.params.pid);
        if (!updatedCart) return res.status(404).json({ error: 'Producto o carrito no encontrado' });

        const io = req.app.get('socketio');
        io.emit('cartUpdated', updatedCart);

        res.json({ message: 'Producto eliminado del carrito', cart: updatedCart });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// DELETE /api/carts/:cid
router.delete('/:cid', async (req, res) => {
    try {
        const emptiedCart = await cartMgr.emptyCart(req.params.cid);
        if (!emptiedCart) return res.status(404).json({ error: 'Carrito no encontrado' });

        const io = req.app.get('socketio');
        io.emit('cartUpdated', emptiedCart);

        res.json({ message: 'Carrito vaciado', cart: emptiedCart });
    } catch (error) {
        console.error('Error al vaciar carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    try {
        const updatedCart = await cartMgr.addProductToCart(cid, pid);

        const io = req.app.get('socketio');
        io.emit('cartUpdated', updatedCart); // emití si querés actualizar en tiempo real

        res.status(200).json({ message: 'Producto agregado al carrito', cart: updatedCart });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ error: 'Error al agregar producto al carrito' });
    }
});

export default router;