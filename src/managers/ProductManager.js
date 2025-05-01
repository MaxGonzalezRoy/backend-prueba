const fs = require('fs').promises;
const path = require('path');

class ProductManager {
    constructor(filePath) {
        this.path = filePath || path.join(__dirname, '../data/products.json');
        this.initializeFile();
    }

    async initializeFile() {
        try {
            await fs.mkdir(path.dirname(this.path), { recursive: true });
            await fs.access(this.path).catch(async () => {
                await fs.writeFile(this.path, JSON.stringify([], null, 2));
            });
        } catch (error) {
            console.error('❌ Error al inicializar el archivo de productos:', error);
            throw error;
        }
    }

    async saveProducts(products) {
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    }

    async getProducts() {
        const data = await fs.readFile(this.path, 'utf-8');
        const parsed = JSON.parse(data);
        console.log("📦 Total de productos cargados:", parsed.length);
        return parsed;
    }

    async getProductById(id) {
        id = Number(id);
        if (isNaN(id)) throw new Error('Product ID must be a number');

        const products = await this.getProducts();
        const product = products.find(p => p.id === id);
        if (!product) throw new Error(`Product with ID ${id} not found`);
        return product;
    }

    async addProduct(product) {
        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
        for (const field of requiredFields) {
            if (!product[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        const products = await this.getProducts();
        if (products.some(p => p.code === product.code)) {
            throw new Error(`Product with code "${product.code}" already exists`);
        }

        const newProduct = {
            ...product,
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            status: product.status !== undefined ? product.status : true,
            thumbnails: product.thumbnails || []
        };

        products.push(newProduct);
        await this.saveProducts(products);
        return newProduct;
    }

    async updateProduct(id, updatedFields) {
        id = Number(id);
        if (isNaN(id)) throw new Error('Product ID must be a number');
        if (updatedFields.id) throw new Error("Cannot update product ID");

        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) throw new Error(`Product with ID ${id} not found`);

        products[index] = { ...products[index], ...updatedFields };
        await this.saveProducts(products);
        return products[index];
    }

    async deleteProduct(id) {
        id = Number(id);
        if (isNaN(id)) throw new Error('Product ID must be a number');

        const products = await this.getProducts();
        const newProducts = products.filter(p => p.id !== id);
        if (products.length === newProducts.length) {
            throw new Error(`Product with ID ${id} not found`);
        }

        await this.saveProducts(newProducts);
        return true;
    }
}

module.exports = ProductManager;