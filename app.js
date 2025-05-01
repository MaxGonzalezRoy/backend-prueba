const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');
const cors = require('cors');

const ProductManager = require('./src/managers/ProductManager');
const CartManager = require('./src/managers/CartManager');
const productManager = new ProductManager();
const cartManager = new CartManager();

const productsRouter = require('./src/routes/products');
const cartsRouter = require('./src/routes/carts');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: ['http://localhost:8080'] }));

app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        json: (context) => JSON.stringify(context),
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', { products });
    } catch (error) {
        res.status(500).send('Error al obtener productos');
    }
});

app.get('/productos', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('products', { products });
    } catch (error) {
        res.status(500).send('Error al obtener productos');
    }
});

app.get('/contacto', (req, res) => {
    res.render('contact');
});

app.get('/cart', async (req, res) => {
    try {
        const cartId = 1;
        const cart = await cartManager.getCartById(cartId);

        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

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

        res.render('cart', { products: enrichedProducts, total });
    } catch (error) {
        console.error('Error en /cart:', error);
        res.status(500).send('Error al cargar el carrito');
    }
});

io.on('connection', async (socket) => {
    console.log('🟢 Nuevo cliente conectado');

    const sendUpdatedProducts = async (toastMessage = null) => {
        try {
            const products = await productManager.getProducts();
            io.emit('products', products);
            if (toastMessage) socket.emit('toast', toastMessage);
        } catch (error) {
            socket.emit('error', error.message);
        }
    };

    try {
        const products = await productManager.getProducts();
        socket.emit('products', products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
    }

    socket.on('new-product', async (data) => {
        try {
            await productManager.addProduct(data);
            await sendUpdatedProducts('✅ Producto agregado con éxito');
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    socket.on('delete-product', async (id) => {
        try {
            await productManager.deleteProduct(id);
            await sendUpdatedProducts('🗑️ Producto eliminado correctamente');
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    socket.on('update-product', async (updatedProduct) => {
        try {
            await productManager.updateProduct(updatedProduct.id, updatedProduct);
            await sendUpdatedProducts('✅ Producto actualizado con éxito');
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    socket.on('add-to-cart', async ({ productId, quantity }) => {
        try {
            const cartId = 1;
            await cartManager.addProductToCart(cartId, productId, quantity);
            const updatedCart = await cartManager.getCartById(cartId);
            socket.emit('cart-updated', updatedCart);
        } catch (error) {
            console.error('Error en add-to-cart:', error);
            socket.emit('error', error.message);
        }
    });
});

app.use((err, req, res, next) => {
    console.error('Error details:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = 8080;
httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});

module.exports = app;