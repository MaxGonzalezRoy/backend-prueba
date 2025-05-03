import { promises as fs } from 'fs';
import path from 'path';

const cartsPath = path.resolve('src/data/carts.json');

export default class CartManager {
    constructor() {
        this.path = cartsPath;
    }

    async _loadCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async _saveCarts(carts) {
        await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
    }

    async createCart() {
        const carts = await this._loadCarts();
        const newId = carts.length ? carts[carts.length - 1].id + 1 : 1;
        const newCart = { id: newId, products: [] };
        carts.push(newCart);
        await this._saveCarts(carts);
        return newCart;
    }

    async getCartById(id) {
        const carts = await this._loadCarts();
        return carts.find(c => c.id === id);
    }

    async addProductToCart(cartId, productId) {
        const carts = await this._loadCarts();
        const cart = carts.find(c => c.id === cartId);
        if (!cart) return null;

        const productInCart = cart.products.find(p => p.product === productId);
        if (productInCart) {
            productInCart.quantity++;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        await this._saveCarts(carts);
        return cart;
    }
}

