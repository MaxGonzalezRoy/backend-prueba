import { Router } from 'express';
import { cartDao } from '../dao/index.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const cart = await cartDao.createCart();
    res.status(201).json({ cart });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el carrito' });
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const cart = await cartDao.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});

router.post('/:cid/products/:pid', async (req, res) => {
  try {
    const updatedCart = await cartDao.addProductToCart(req.params.cid, req.params.pid);
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

router.put('/:cid', async (req, res) => {
  try {
    const updatedCart = await cartDao.updateCart(req.params.cid, req.body);
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el carrito' });
  }
});

router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { quantity } = req.body;
    const updatedProduct = await cartDao.updateProductQuantity(req.params.cid, req.params.pid, quantity);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la cantidad del producto' });
  }
});

router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const updatedCart = await cartDao.removeProductFromCart(req.params.cid, req.params.pid);
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto del carrito' });
  }
});

router.delete('/:cid', async (req, res) => {
  try {
    const clearedCart = await cartDao.clearCart(req.params.cid);
    res.json(clearedCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
});

export default router;