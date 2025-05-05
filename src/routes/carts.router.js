import { Router } from 'express';
import CartManager from '../managers/cartManager.js';
import ProductManager from '../managers/productManager.js'; // ⬅️ nuevo

const router = Router();
const cartManagerInstance = new CartManager();
const productManager = new ProductManager(); // ⬅️ instancia del gestor de productos

// POST /api/carts - Crear nuevo carrito
router.post('/', async (req, res) => {
    const newCart = await cartManagerInstance.createCart();
    res.status(201).json(newCart);
});

// GET /api/carts/:cid - Obtener productos enriquecidos de un carrito
router.get('/:cid', async (req, res) => {
    const cid = parseInt(req.params.cid);
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

export default router;