import express from 'express';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import handlebars from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './src/routes/products.router.js';
import cartsRouter from './src/routes/carts.router.js';
import viewsRouter from './src/routes/views.router.js';

// Configuración de rutas absolutas para usar __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));

// Motor de plantillas Handlebars
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/src/views'));

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Pasar socket.io al resto de la app
app.set('socketio', io);

// Eventos WebSocket
io.on('connection', socket => {
    console.log('🟢 Cliente conectado vía Socket.io');

    socket.on('disconnect', () => {
        console.log('🔴 Cliente desconectado');
    });
});

// Iniciar servidor
const PORT = 8080;
httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
