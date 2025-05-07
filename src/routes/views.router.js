// ✅ views.router.js
import { Router } from 'express';
import CartManager from '../managers/cartManager.js';
import ProductManager from '../managers/productManager.js';

const viewsRouter = Router();

const cartManagerInstance = new CartManager();
const productManager = new ProductManager();

// INICIO
viewsRouter.get('/', (req, res) => {
    res.render('home');
});

// HOME
viewsRouter.get('/home', async (req, res) => {
    const products = await productManager.getAll();
    res.render('home', { products });
});

// PRODUCTOS
viewsRouter.get('/products', async (req, res) => {
    const products = await productManager.getAll();
    res.render('products', { products });
});

// VISTA EN TIEMPO REAL
viewsRouter.get('/realtimeproducts', async (req, res) => {
    const products = await productManager.getAll();
    res.render('realTimeProducts', { products });
});

// REDIRECCIÓN /cart ➡️ /carts/1 (carrito por defecto)
viewsRouter.get('/cart', (req, res) => {
    const defaultCartId = 1; // Podrías obtenerlo dinámicamente en el futuro
    res.redirect(`/carts/${defaultCartId}`);
});


// CARRITO
viewsRouter.get('/carts/:cid', async (req, res) => {
    const cid = parseInt(req.params.cid);
    const cart = await cartManagerInstance.getCartById(cid);

    if (!cart) return res.render('error', { message: 'Carrito no encontrado' });

    const enrichedProducts = await Promise.all(
        cart.products.map(async (item) => {
            const product = await productManager.getById(item.product);
            return {
                id: item.product,
                name: product?.title || 'Producto no disponible',
                price: product?.price || 0,
                quantity: item.quantity
            };
        })
    );

    // Calcular el total del carrito
    const totalPrice = enrichedProducts.reduce((total, item) => total + (item.price * item.quantity), 0);

    res.render('carts', {
        cart: {
            id: cart.id,
            products: enrichedProducts,
            totalPrice: totalPrice.toFixed(2) // Formatear a dos decimales
        }
    });
});

export default viewsRouter;