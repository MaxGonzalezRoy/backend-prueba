import express, { Router } from 'express'; // ✅ Usamos esta sola vez
import path from 'path';
import { fileURLToPath } from 'url';
import exphbs from 'express-handlebars';
import { Server } from 'socket.io';
import router from './products.router.js'; // no lo estás usando en este archivo aún

// --- Configuración para __dirname con ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viewsRouter = Router(); // usás Router() que ya importaste arriba

const app = express();
const PORT = 8080;

// --- Rutas para vistas ---
viewsRouter.get('/', (req, res) => {
  res.render('home');
});

viewsRouter.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts');
});

viewsRouter.get('/products', (req, res) => {
  res.render('products');
});

viewsRouter.get('/carts', (req, res) => {
  res.render('carts');
});

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Asegúrate que 'public' contiene tus CSS y assets

// --- Motor de plantillas (Handlebars) ---
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// --- Rutas ---
app.use('/', viewsRouter);
app.use('/api/products', router);

// --- Servidor HTTP + WebSockets ---
const httpServer = app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});

const io = new Server(httpServer);
app.set('socketio', io);

// WebSocket básico de ejemplo
io.on('connection', socket => {
  console.log('🔌 Cliente conectado vía WebSocket');
});

export default viewsRouter;