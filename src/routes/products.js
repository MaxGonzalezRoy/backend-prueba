const express = require('express');
const ProductManager = require('../managers/ProductManager');
const path = require('path');

const router = express.Router();
const productManager = new ProductManager(path.join(__dirname, '../data/products.json'));

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'No se pudieron cargar los productos' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'No se pudo agregar el producto', details: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await productManager.updateProduct(req.params.id, req.body);
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'No se pudo actualizar el producto', details: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await productManager.deleteProduct(req.params.id);
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo eliminar el producto', details: error.message });
    }
});

module.exports = router;