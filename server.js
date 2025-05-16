import express from 'express';
import { engine } from 'express-handlebars';
import mongoose from 'mongoose';
import { Server as SocketServer } from 'socket.io';
import http from 'http';
import viewsRouter from './src/routes/views.router.js';
import productsRouter from './src/routes/products.router.js';
import cartsRouter from './src/routes/carts.router.js';
import path from 'path';
import { rootDir } from './src/utils.js';
import { productDao, cartDao } from './src/dao/index.js';

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);
app.set('socketio', io);

const PORT = process.env.PORT || 8080;
const PERSISTENCE = process.env.PERSISTENCE || 'file'; // Usar 'mongo' o 'file'

// Conexión a Mongo solo si es necesaria
if (PERSISTENCE === 'mongo') {
  mongoose.connect('mongodb://localhost:27017/ecommerce')
    .then(() => {
      console.log('✅ Conectado a MongoDB');
      server.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ Error conectando a MongoDB:', err);
    });
} else {
  server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
  });
}

// Helpers Handlebars
function getPrevPageLink(page) {
  const p = Math.max(Number(page) - 1, 1);
  return `/products?page=${p}`;
}
function getNextPageLink(page) {
  const p = Number(page) + 1;
  return `/products?page=${p}`;
}

// Configuración Handlebars
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(rootDir, 'src', 'views', 'layouts'),
  helpers: {
    eq: (a, b) => a === b,
    range: (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(rootDir, 'src', 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, 'public')));

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// WebSocket
io.on('connection', socket => {
  console.log('🟢 Cliente conectado');

  socket.on('new-product', async (newProduct) => {
    await productDao.addProduct(newProduct);
    const updatedProducts = await productDao.getProducts();
    io.emit('update-products', updatedProducts);
  });

  socket.on('delete-product', async (productId) => {
    await productDao.deleteProduct(productId);
    const updatedProducts = await productDao.getProducts();
    io.emit('update-products', updatedProducts);
  });

  socket.on('cart-modified', async (cartId) => {
    const updatedCart = await cartDao.getCartById(cartId);
    io.emit('cartUpdated', updatedCart);
  });

  socket.on('cart-created', async () => {
    const allCarts = await cartDao.getAllCarts();
    io.emit('cartListUpdated', allCarts);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado');
  });
});

// Vista productos
app.get('/products', async (req, res) => {
  const { limit = 10, page = 1, sort = '', category = '' } = req.query;

  try {
    const result = await productDao.getProductsPaginated?.({
      limit: Number(limit),
      page: Number(page),
      sort,
      category,
    });

    if (!result || !result.docs) {
      return res.render('products', {
        products: await productDao.getProducts(),
        pagination: null
      });
    }

    const query = { category, sort };
    const queryString = Object.entries(query)
      .filter(([_, val]) => val !== '')
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    res.render('products', {
      products: result.docs,
      pagination: {
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        currentPage: result.page,
        totalPages: result.totalPages
      },
      prevLink: result.hasPrevPage
        ? `/products?page=${result.prevPage}&limit=${limit}${queryString ? `&${queryString}` : ''}`
        : null,
      nextLink: result.hasNextPage
        ? `/products?page=${result.nextPage}&limit=${limit}${queryString ? `&${queryString}` : ''}`
        : null,
      query,
      queryString
    });
  } catch (err) {
    console.error('❌ Error al obtener productos paginados:', err.message);
    res.status(500).send('Error al cargar productos');
  }
});

// Vista carrito
app.get('/carts/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartDao.getCartById(cartId);
    res.render('carts', { cart });
  } catch (err) {
    res.status(404).send('Carrito no encontrado');
  }
});