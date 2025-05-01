const fs = require('fs').promises;
const path = require('path');
const ProductManager = require('./ProductManager');

class CartManager {
    constructor() {
        this.path = path.join(__dirname, '../data/carts.json');
        this.productManager = new ProductManager();
        this.initializeFile();
    }

    async initializeFile() {
        try {
            await fs.mkdir(path.dirname(this.path), { recursive: true });
            await fs.access(this.path).catch(async () => {
                await fs.writeFile(this.path, JSON.stringify([], null, 2));
            });
        } catch (error) {
            console.error('Error initializing carts file:', error);
            throw error;
        }
    }

    async saveCarts(carts) {
        await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
    }

    async createCart() {
        const carts = await this.getCarts();
        const newCart = {
            id: carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1,
            products: []
        };
        carts.push(newCart);
        await this.saveCarts(carts);
        return newCart;
    }

    async getCarts() {
        const data = await fs.readFile(this.path, 'utf-8');
        return JSON.parse(data);
    }

    async getCartById(id) {
        if (isNaN(id)) throw new Error('Cart ID must be a number');
        const carts = await this.getCarts();
        const cart = carts.find(c => c.id === id);
        if (!cart) throw new Error(`Cart with ID ${id} not found`);
        return cart;
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        if (isNaN(cartId) || isNaN(productId) || quantity <= 0) {
            throw new Error('Invalid cartId, productId or quantity');
        }

        await this.productManager.getProductById(productId);

        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId);
        if (cartIndex === -1) throw new Error(`Cart with ID ${cartId} not found`);

        const productIndex = carts[cartIndex].products.findIndex(
            p => p.product === productId
        );

        if (productIndex !== -1) {
            carts[cartIndex].products[productIndex].quantity += quantity;
        } else {
            carts[cartIndex].products.push({ product: productId, quantity });
        }

        await this.saveCarts(carts);
        return carts[cartIndex];
    }
}

module.exports = CartManager;