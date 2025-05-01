const express = require('express');
const ProductManager = require('../managers/ProductManager');
const path = require('path');

const router = express.Router();
const productManager = new ProductManager(path.join(__dirname, '../data/products.json'));

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'No se pudieron cargar los productos', details: error.message });
    }
});

// Agregar un nuevo producto
router.post('/', async (req, res) => {
    try {
        // Verificación de los datos del producto
        const { name, price, description, category } = req.body;
        if (!name || !price || !description || !category) {
            return res.status(400).json({ error: 'Faltan datos obligatorios del producto' });
        }

        const newProduct = await productManager.addProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'No se pudo agregar el producto', details: error.message });
    }
});

// Actualizar un producto
router.put('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedData = req.body;

        // Verificar si el producto existe antes de intentar actualizar
        const product = await productManager.getProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const updatedProduct = await productManager.updateProduct(productId, updatedData);
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'No se pudo actualizar el producto', details: error.message });
    }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        // Verificar si el producto existe antes de intentar eliminar
        const product = await productManager.getProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await productManager.deleteProduct(productId);
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo eliminar el producto', details: error.message });
    }
});

module.exports = router;