import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const cartsPath = path.resolve('src/data/carts.json');

export default class CartManager {
  constructor() {
    this.path = cartsPath;
  }

  async readCarts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  }

  async writeCarts(carts) {
    await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
  }

  async getCartById(cartId) {
    const carts = await this.readCarts();
    return carts.find(cart => cart.id === cartId);
  }

  async createCart() {
    const carts = await this.readCarts();
    const newCart = {
      id: uuidv4(),
      products: []
    };
    carts.push(newCart);
    await this.writeCarts(carts);
    return newCart;
  }

  async addProductToCart(cartId, productId) {
    const carts = await this.readCarts();
    const cart = carts.find(c => c.id === cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const existingProduct = cart.products.find(p => p.product === productId);
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await this.writeCarts(carts);
    return cart;
  }

  async removeProductFromCart(cartId, productId) {
    const carts = await this.readCarts();
    const cart = carts.find(c => c.id === cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = cart.products.filter(p => p.product !== productId);

    await this.writeCarts(carts);
    return cart;
  }

  async updateCart(cartId, newProducts) {
    const carts = await this.readCarts();
    const cart = carts.find(c => c.id === cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = newProducts;

    await this.writeCarts(carts);
    return cart;
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const carts = await this.readCarts();
    const cart = carts.find(c => c.id === cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const product = cart.products.find(p => p.product === productId);
    if (!product) throw new Error('Producto no encontrado en el carrito');

    product.quantity = quantity;

    await this.writeCarts(carts);
    return cart;
  }

  async clearCart(cartId) {
    const carts = await this.readCarts();
    const cart = carts.find(c => c.id === cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = [];

    await this.writeCarts(carts);
    return cart;
  }
}