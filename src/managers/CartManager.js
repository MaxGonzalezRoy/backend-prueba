import Cart from '../models/Cart.js';

export default class CartManager {
    async createCart() {
        const newCart = new Cart({ products: [] });
        return await newCart.save();
    }

    async getCartById(cartId) {
        return await Cart.findById(cartId).populate('products.product');
    }

    // Corrección de la definición del método addToCart
    async addToCart(productId) {
        // Obtener el cartId desde localStorage
        const cartId = localStorage.getItem('cartId');

        if (!cartId) {
            Swal.fire('Error', 'No tienes un carrito activo.', 'error');
            return;
        }

        try {
            const res = await fetch(`/api/carts/${cartId}/product/${productId}`, { method: 'POST' });

            if (res.ok) {
                Swal.fire({
                    title: 'Agregado',
                    text: 'Producto agregado al carrito.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                Swal.fire('Error', 'No se pudo agregar el producto.', 'error');
            }
        } catch (err) {
            console.error('Error al agregar al carrito:', err);
            Swal.fire('Error', 'Error inesperado al agregar al carrito.', 'error');
        }
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