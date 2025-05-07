import { Router } from 'express';
import CartManager from '../managers/cartManager.js';
import ProductManager from '../managers/productManager.js';

const router = Router();
const cartManagerInstance = new CartManager();
const productManager = new ProductManager(); // Instancia del gestor de productos

// POST /api/carts - Crear nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManagerInstance.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el carrito' });
    }
});

// GET /api/carts/:cid - Obtener productos enriquecidos de un carrito
router.get('/:cid', async (req, res) => {
    const cid = parseInt(req.params.cid);
    try {
        const cart = await cartManagerInstance.getCartById(cid);

        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        // Enriquecer cada producto con sus datos
        const enrichedProducts = await Promise.all(
            cart.products.map(async (item) => {
                const product = await productManager.getById(item.product);
                return {
                    id: item.product,
                    title: product?.title || 'Producto no disponible',
                    price: product?.price || null,
                    quantity: item.quantity
                };
            })
        );

        res.json({
            cartId: cart.id,
            products: enrichedProducts
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
});

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await cartManagerInstance.addProductToCart(cid, pid);
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/carts/:cid/product/:pid - Eliminar un producto del carrito
router.delete('/:cid/product/:pid', async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);

    try {
        const updatedCart = await cartManager.removeProductFromCart(cartId, productId);
        if (!updatedCart) return res.status(404).json({ error: 'Carrito o producto no encontrado' });

        res.json({ message: 'Producto eliminado del carrito', cart: updatedCart });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
    }
});

export default router;