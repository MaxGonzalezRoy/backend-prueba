const CartManager = require('../managers/CartManager');
const config = require('../../config/config');

class CartService {
    constructor() {
        console.log('Ruta de carritos:', config.files.carts);
        this.manager = new CartManager(config.files.carts);    }

    async getCartById(id) {
        try {
            const cart = await this.manager.getCartById(id);
            return {
                success: true,
                cart
            };
        } catch (error) {
            throw new Error(`Error obteniendo carrito: ${error.message}`);
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const updatedCart = await this.manager.addProductToCart(cartId, productId, quantity);
            return {
                success: true,
                cart: updatedCart
            };
        } catch (error) {
            throw new Error(`Error agregando producto al carrito: ${error.message}`);
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const updatedCart = await this.manager.removeProductFromCart(cartId, productId);
            return {
                success: true,
                cart: updatedCart
            };
        } catch (error) {
            throw new Error(`Error eliminando producto del carrito: ${error.message}`);
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            const updatedCart = await this.manager.updateProductQuantity(cartId, productId, quantity);
            return {
                success: true,
                cart: updatedCart
            };
        } catch (error) {
            throw new Error(`Error actualizando cantidad: ${error.message}`);
        }
    }
}

module.exports = CartService;