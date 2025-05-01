require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');

// Inicialización
const app = express();
const httpServer = createServer(app);

// Configuración de Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: config.app.frontendUrl,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Middlewares básicos
app.use(helmet());
app.use(cors({ origin: config.app.frontendUrl }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    extname: '.handlebars',
    helpers: require('./src/utils/helpers')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use('/api/products', require('./src/routes/products'));
app.use('/api/carts', require('./src/routes/carts'));
app.use('/', require('./src/routes/views'));

// Sockets
require('./src/sockets/product.sockets')(io);
require('./src/sockets/cart.sockets')(io);

// Manejo de errores
app.use(require('./src/middlewares/errorHandler'));

// Iniciar servidor
httpServer.listen(config.app.port, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${config.app.port}`);
    console.log(`Entorno: ${config.app.env}`);
});

module.exports = app;