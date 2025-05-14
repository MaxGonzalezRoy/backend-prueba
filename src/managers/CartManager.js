import Cart from '../models/Cart.js';

export default class CartManager {
    async createCart() {
        const newCart = new Cart({ products: [] });
        return await newCart.save();
    }

    async getCartById(cartId) {
        return await Cart.findById(cartId).populate('products.product');
    }

    // ✅ Método correcto para agregar un producto al carrito (BACKEND)
    async addProductToCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const index = cart.products.findIndex(p => p.product.toString() === productId);
    if (index >= 0) {
        cart.products[index].quantity += 1;
    } else {
        cart.products.push({ product: productId, quantity: 1 });
    }

    return await cart.save();
}

    async updateProductQuantity(cartId, productId, quantity) {
        const cart = await Cart.findById(cartId);
        if (!cart) return null;

        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
        if (productIndex === -1) return null;

        cart.products[productIndex].quantity = quantity;
        return await cart.save();
    }

    async removeProduct(cartId, productId) {
        const cart = await Cart.findById(cartId);
        if (!cart) return null;

        cart.products = cart.products.filter(p => p.product.toString() !== productId);
        return await cart.save();
    }

    async emptyCart(cartId) {
        const cart = await Cart.findById(cartId);
        if (!cart) return null;

        cart.products = [];
        return await cart.save();
    }

    async getAllCarts() {
        return await Cart.find().populate('products.product');
    }
}