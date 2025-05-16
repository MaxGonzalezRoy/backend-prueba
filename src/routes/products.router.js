import { Router } from 'express';
import { productDao } from '../dao/index.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    console.log("📥 GET /api/products llamado");
    const products = await productDao.getProducts();
    console.log("📤 Enviando productos al cliente:", products);
    res.json(products);
  } catch (error) {
    console.error("❌ Error en GET /api/products:", error.message);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    console.log(`🔍 GET /api/products/${req.params.pid}`);
    const product = await productDao.getProductById(req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    console.error("❌ Error al obtener el producto:", error.message);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log("➕ POST /api/products con body:", req.body);
    const product = await productDao.addProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Error al agregar producto:", error.message);
    res.status(400).json({ error: 'Error al agregar producto' });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    console.log(`✏️ PUT /api/products/${req.params.pid} con body:`, req.body);
    const updated = await productDao.updateProduct(req.params.pid, req.body);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(updated);
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error.message);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    console.log(`🗑 DELETE /api/products/${req.params.pid}`);
    const deleted = await productDao.deleteProduct(req.params.pid);
    if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error.message);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;