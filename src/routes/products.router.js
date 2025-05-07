import { Router } from 'express';
import ProductManager from '../managers/productManager.js';
const router = Router();

const productMgr = new ProductManager(); // Evita conflicto de nombres

// GET /api/products
router.get('/', async (req, res) => {
    try {
        const products = await productMgr.getAll();
        res.json(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const product = await productMgr.getById(pid);
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(product);
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

// POST /api/products
router.post('/', async (req, res) => {
    try {
        const newProduct = req.body;

        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
        const missingFields = requiredFields.filter(field => !newProduct[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Faltan los siguientes campos obligatorios: ${missingFields.join(', ')}` });
        }

        const addedProduct = await productMgr.addProduct(newProduct);

        // 🔧 Obtener io desde la app (gracias a app.set())
        const io = req.app.get('socketio');
        const updatedList = await productMgr.getAll();
        io.emit('productListUpdated', updatedList);

        res.status(201).json({ message: 'Producto agregado', product: addedProduct });
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        res.status(500).json({ error: 'Error al agregar el producto' });
    }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const updateData = req.body;

        if (updateData.id) return res.status(400).json({ error: 'No se puede modificar el ID del producto' });

        const updatedProduct = await productMgr.updateProduct(pid, updateData);
        if (!updatedProduct) return res.status(404).json({ error: 'Producto no encontrado' });

        res.json({ message: 'Producto actualizado', product: updatedProduct });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const result = await productMgr.deleteProduct(pid);
        if (!result) return res.status(404).json({ error: 'Producto no encontrado' });

        // 🔧 Emitir actualización
        const io = req.app.get('socketio');
        const updatedList = await productMgr.getAll();
        io.emit('productListUpdated', updatedList);

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

export default router;