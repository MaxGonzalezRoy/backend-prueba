const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');
const cors = require('cors');
const hbs = require('express-handlebars');

// Managers
const ProductManager = require('./src/managers/ProductManager');
const CartManager = require('./src/managers/CartManager');
const productManager = new ProductManager();
const cartManager = new CartManager();

// Rutas
const productsRouter = require('./src/routes/products');
const cartsRouter = require('./src/routes/carts');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Socket.io (lógica separada)
require('./src/socket/socket')(io, productManager, cartManager);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src', 'public')));

app.engine('handlebars', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'src', 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'src', 'views', 'partials'),
    helpers: {
        json: (context) => JSON.stringify(context),
        
        // Helper para multiplicar cantidad y precio
        multiply: (quantity, price) => quantity * price,

        // Helper para calcular el total del carrito
        calcTotal: (products) => products.reduce((total, product) => total + (product.quantity * product.product.price), 0)
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(cors({
    origin: ['http://localhost:8080'],
}));

// Rutas API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Vistas
app.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('pages/home', { products });
    } catch (error) {
        res.status(500).send('Error al obtener productos');
    }
});

app.get('/productos', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('pages/products', { products });
    } catch (error) {
        res.status(500).send('Error al obtener productos');
    }
});

app.get('/contacto', (req, res) => {
    res.render('pages/contact');
});

app.get('/cart', async (req, res) => {
    try {
        const cartId = 1;
        const cart = await cartManager.getCartById(cartId);

        const enrichedProducts = await Promise.all(
            cart.products.map(async (item) => {
                const product = await productManager.getProductById(item.product);
                return {
                    id: item.product,
                    title: product.title,
                    price: product.price,
                    quantity: item.quantity,
                    total: product.price * item.quantity
                };
            })
        );

        const total = enrichedProducts.reduce((sum, p) => sum + p.total, 0);

        res.render('pages/cart', { products: enrichedProducts, total });
    } catch (error) {
        res.status(500).send('Error al cargar el carrito');
    }
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error details:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message, stack: err.stack });
});

// Servidor
const PORT = 8080;
httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});

module.exports = app;