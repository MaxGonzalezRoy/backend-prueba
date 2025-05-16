import { Router } from 'express';
import { productDao, cartDao } from '../dao/index.js';

const viewsRouter = Router();

// INICIO
viewsRouter.get('/', (req, res) => {
    res.render('home');
});

// HOME
viewsRouter.get('/home', async (req, res) => {
    const products = await productDao.getProducts(); // CORRECTO: productDao (sin s)
    res.render('home', { products });
});

// PRODUCTOS CON PAGINACIÓN Y FILTROS
viewsRouter.get('/products', async (req, res) => {
    try {
        const query = req.query;
        const { page = 1, limit = 10, category, sort } = query;

        const filters = {};
        if (category) filters.category = category;

        const sortOptions = (sort === 'asc' || sort === 'desc') ? { price: sort } : {};

        // CORREGIDO: productDao en lugar de productsDao
        const products = await productDao.getProductsPaginated(filters, {
            page,
            limit,
            sort: sortOptions,
            lean: true
        });

        products.queryString = new URLSearchParams({
            ...(category && { category }),
            ...(sort && { sort }),
        }).toString();

        res.render('products', {
            title: 'Productos',
            style: 'products.css',
            products
        });
    } catch (error) {
        console.error('❌ Error al obtener productos paginados:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Vista que renderiza el HTML vacío (JS lo llena todo)
viewsRouter.get('/products-dynamic', (req, res) => {
    res.render('products-dynamic');
});

// VISTA DINÁMICA DE CARRITO USANDO localStorage
viewsRouter.get('/cart', (req, res) => {
    res.render('carts');
});

// VISTA CARRITO ESTÁTICA POR ID
viewsRouter.get('/carts/:cid', async (req, res) => {
    try {
        const cid = req.params.cid;

        // CORREGIDO: cartDao en lugar de cartsDao
        const cart = await cartDao.getCartById(cid);

        if (!cart) {
            return res.render('error', { message: 'Carrito no encontrado' });
        }

        const enrichedProducts = await Promise.all(
            cart.products.map(async (item) => {
                const product = await productDao.getProductById(item.product._id || item.product);
                return {
                    id: item.product._id || item.product,
                    name: product?.title || 'Producto no disponible',
                    price: product?.price || 0,
                    quantity: item.quantity
                };
            })
        );

        const totalPrice = enrichedProducts.reduce(
            (total, item) => total + (item.price * item.quantity), 0
        );

        res.render('carts', {
            layout: 'main',
            cart: {
                id: cart._id,
                products: enrichedProducts,
                totalPrice: totalPrice.toFixed(2)
            }
        });
    } catch (error) {
        console.error('❌ Error al obtener carrito:', error);
        res.status(500).send('Error interno del servidor');
    }
});

export default viewsRouter;