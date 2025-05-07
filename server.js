import express from 'express';
import { Server as SocketServer } from 'socket.io';
import http from 'http';
import viewsRouter from './src/routes/views.router.js';
import ProductManager from './src/managers/productManager.js';
import CartManager from './src/managers/cartManager.js';
import { engine } from 'express-handlebars';
import path from 'path';
import cartsRouter from './src/routes/carts.router.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);
const PORT = process.env.PORT || 8080;

// Instancias de los managers
const productManager = new ProductManager();
const cartManager = new CartManager(); // Aún no usado, pero listo

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src/public')));

// Rutas
app.use('/api/carts', cartsRouter);
app.use('/carts', cartsRouter); // si usás ambas rutas
app.use('/', viewsRouter);

// WebSockets
io.on('connection', socket => {
  console.log('🟢 Cliente conectado');

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

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado');
  });
});

// Seguridad opcional (CSP)
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
    "img-src 'self' data:; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;"
  );
  next();
});

// Server ON
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
});
