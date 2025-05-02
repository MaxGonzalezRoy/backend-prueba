import { Router } from 'express';
import ProductManager from '../managers/productManager.js';
const router = Router();

const productManager = new ProductManager('./src/data/products.json');

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// GET /api/products/:pid - Obtener un producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const product = await productManager.getProductById(pid);

        if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

// POST /api/products - Agregar un nuevo producto
router.post('/', async (req, res) => {
    try {
        const newProduct = req.body;

        // Validación básica
        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
        for (const field of requiredFields) {
        if (!newProduct[field]) {
            return res.status(400).json({ error: `Falta el campo obligatorio: ${field}` });
        }
        }

    const addedProduct = await productManager.addProduct(newProduct);

    // Emitir actualización a todos los clientes
    const io = req.app.get('socketio');
    const updatedList = await productManager.getProducts();
    io.emit('productListUpdated', updatedList);

    res.status(201).json({ message: 'Producto agregado', product: addedProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto' });
    }
});

// PUT /api/products/:pid - Actualizar un producto por ID
router.put('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const updateData = req.body;

        // No se puede modificar el ID
        if (updateData.id) {
        return res.status(400).json({ error: 'No se puede modificar el ID del producto' });
        }

        const updatedProduct = await productManager.updateProduct(pid, updateData);

        if (!updatedProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto actualizado', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// DELETE /api/products/:pid - Eliminar un producto por ID
router.delete('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const result = await productManager.deleteProduct(pid);

        if (!result) {
        return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Emitir actualización a todos los clientes
        const io = req.app.get('socketio');
        const updatedList = await productManager.getProducts();
        io.emit('productListUpdated', updatedList);

        res.json({ message: 'Producto eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

export default router;