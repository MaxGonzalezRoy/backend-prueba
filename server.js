import express from 'express';
import { Server as SocketServer } from 'socket.io';
import http from 'http';
import viewsRouter from './src/routes/views.router.js';
import ProductManager from './src/managers/productManager.js';
import CartManager from './src/managers/cartManager.js';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);
const PORT = process.env.PORT || 8080

// Instancias de los managers
const productManager = new ProductManager();
const cartManager = new CartManager();

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('src/public'));
app.use(express.static(__dirname + '/src/public'));

// Rutas
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

// Server ON
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
});