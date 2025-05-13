import express from 'express';
import { Server as SocketServer } from 'socket.io';
import http from 'http';
import viewsRouter from './src/routes/views.router.js';
import ProductManager from './src/managers/productManager.js';
import CartManager from './src/managers/cartManager.js';
import realTimeProductsRouter from './src/routes/realTimeProducts.router.js';
import { engine } from 'express-handlebars';
import path from 'path';
import cartsRouter from './src/routes/carts.router.js';
import { fileURLToPath } from 'url';
import productsRouter from './src/routes/products.router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);

// Inyección de socket en app para usarlo en routers
app.set('socketio', io);

const PORT = process.env.PORT || 8080;

// Managers
const productManager = new ProductManager();
const cartManager = new CartManager();

// Handlebars con layout
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'src/views/layouts'),
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/carts', cartsRouter);
app.use('/realtimeproducts', realTimeProductsRouter);
app.use('/', viewsRouter);

// WebSocket
io.on('connection', socket => {
  console.log('🟢 Cliente conectado');

  // Productos
  socket.on('new-product', async (newProduct) => {
    await productManager.addProduct(newProduct);
    const updatedProducts = await productManager.getAll();
    io.emit('update-products', updatedProducts);
  });

  socket.on('delete-product', async (productId) => {
    await productManager.deleteProduct(productId);
    const updatedProducts = await productManager.getAll();
    io.emit('update-products', updatedProducts);
  });

  // Carritos
  socket.on('cart-modified', async (cartId) => {
    const updatedCart = await cartManager.getCartById(cartId);
    io.emit('cartUpdated', updatedCart);
  });

  socket.on('cart-created', async () => {
    const allCarts = await cartManager.getAllCarts(); // Este método debe existir
    io.emit('cartListUpdated', allCarts);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado');
  });
});

// Vista de productos
app.get('/products', async (req, res) => {
  const { limit = 10, page = 1, sort = '', query = '' } = req.query;
  const products = await productManager.getAll({ limit, page, sort, query });
  res.render('products', {
    products,
    prevLink: getPrevPageLink(page),
    nextLink: getNextPageLink(page),
  });
});

// Vista de un carrito
app.get('/carts/:cid', async (req, res) => {
  const cartId = req.params.cid;
  const cart = await cartManager.getCartById(cartId);
  res.render('cart', {
    cart,
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
});
