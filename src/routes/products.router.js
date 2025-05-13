import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();

// GET /api/products con paginación, filtros y ordenamientos
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        const filter = {};
        if (query) {
            if (query === 'disponibles') filter.stock = { $gt: 0 };
            else filter.category = query;
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : undefined,
            lean: true
        };

        const result = await Product.paginate(filter, options);

        const { docs, totalPages, prevPage, nextPage, hasPrevPage, hasNextPage } = result;

        const baseUrl = req.protocol + '://' + req.get('host') + req.baseUrl;

        res.json({
            status: 'success',
            payload: docs,
            totalPages,
            prevPage,
            nextPage,
            page: parseInt(page),
            hasPrevPage,
            hasNextPage,
            prevLink: hasPrevPage ? `${baseUrl}?page=${prevPage}&limit=${limit}` : null,
            nextLink: hasNextPage ? `${baseUrl}?page=${nextPage}&limit=${limit}` : null
        });
    } catch (error) {
        console.error('Error al obtener productos paginados:', error);
        res.status(500).json({ status: 'error', error: 'Error interno del servidor' });
    }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const product = await Product.findById(pid);
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

        const addedProduct = await Product.create(newProduct);

        const io = req.app.get('socketio');
        const updatedList = await Product.find().lean();
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

        const updatedProduct = await Product.findByIdAndUpdate(pid, updateData, { new: true });
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
        const result = await Product.findByIdAndDelete(pid);
        if (!result) return res.status(404).json({ error: 'Producto no encontrado' });

        const io = req.app.get('socketio');
        const updatedList = await Product.find().lean();
        io.emit('productListUpdated', updatedList);

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

export default router;
