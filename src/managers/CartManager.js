const fs = require('fs').promises;
const path = require('path');

class CartManager {
    constructor(filePath) {
        if (!filePath || typeof filePath !== 'string') {
            throw new Error('La ruta del archivo es requerida y debe ser una cadena de texto');
        }
        
        this.path = path.resolve(filePath);
        this.carts = [];
        this.lastId = 0;
        
        console.log('Ruta de carritos configurada en:', this.path);
        this.initialize().catch(error => {
            console.error('Error inicializando CartManager:', error);
        });
    }

    async initialize() {
        try {
            await this.ensureFileExists();
            await this.loadCarts();
            console.log('✅ CartManager inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando CartManager:', error.message);
            throw error;
        }
    }

    async ensureFileExists() {
        try {
            await fs.mkdir(path.dirname(this.path), { recursive: true });
            await fs.access(this.path).catch(async () => {
                await fs.writeFile(this.path, JSON.stringify([], null, 2));
            });
        } catch (error) {
            throw new Error(`Error inicializando archivo: ${error.message}`);
        }
    }

    async loadCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            this.carts = JSON.parse(data);
            this.lastId = this.carts.reduce((max, cart) => Math.max(max, cart.id), 0);
            console.log(`📦 ${this.carts.length} carritos cargados`);
        } catch (error) {
            throw new Error(`Error cargando carritos: ${error.message}`);
        }
    }

    async saveCarts() {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2));
        } catch (error) {
            throw new Error(`Error guardando carritos: ${error.message}`);
        }
    }

    async createCart() {
        try {
            const newCart = {
                id: ++this.lastId,
                products: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.carts.push(newCart);
            await this.saveCarts();
            
            return newCart;
        } catch (error) {
            throw new Error(`Error creando carrito: ${error.message}`);
        }
    }

    async getCartById(id) {
        try {
            const cart = this.carts.find(c => c.id === id);
            if (!cart) throw new Error(`Carrito con ID ${id} no encontrado`);
            return cart;
        } catch (error) {
            throw new Error(`Error obteniendo carrito: ${error.message}`);
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cartIndex = this.carts.findIndex(c => c.id === cartId);
            if (cartIndex === -1) throw new Error(`Carrito no encontrado`);

            const productIndex = this.carts[cartIndex].products.findIndex(
                p => p.product === productId
            );

            if (productIndex !== -1) {
                this.carts[cartIndex].products[productIndex].quantity += quantity;
            } else {
                this.carts[cartIndex].products.push({
                    product: productId,
                    quantity
                });
            }

            this.carts[cartIndex].updatedAt = new Date().toISOString();
            await this.saveCarts();

            return this.carts[cartIndex];
        } catch (error) {
            throw new Error(`Error agregando producto: ${error.message}`);
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cartIndex = this.carts.findIndex(c => c.id === cartId);
            if (cartIndex === -1) throw new Error(`Carrito no encontrado`);

            const initialLength = this.carts[cartIndex].products.length;
            this.carts[cartIndex].products = this.carts[cartIndex].products.filter(
                p => p.product !== productId
            );

            if (this.carts[cartIndex].products.length === initialLength) {
                throw new Error(`Producto no encontrado en el carrito`);
            }

            this.carts[cartIndex].updatedAt = new Date().toISOString();
            await this.saveCarts();

            return this.carts[cartIndex];
        } catch (error) {
            throw new Error(`Error eliminando producto: ${error.message}`);
        }
    }

    async clearCart(cartId) {
        try {
            const cartIndex = this.carts.findIndex(c => c.id === cartId);
            if (cartIndex === -1) throw new Error(`Carrito no encontrado`);

            this.carts[cartIndex].products = [];
            this.carts[cartIndex].updatedAt = new Date().toISOString();
            await this.saveCarts();

            return {
                success: true,
                message: `Carrito ${cartId} vaciado correctamente`
            };
        } catch (error) {
            throw new Error(`Error vaciando carrito: ${error.message}`);
        }
    }
}

module.exports = CartManager;