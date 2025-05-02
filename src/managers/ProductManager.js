import { promises as fs } from 'fs';
import path from 'path';

const productsPath = path.resolve('src/data/products.json');

export default class ProductManager {
    constructor() {
        this.path = productsPath;
    }

    async _loadProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async _saveProducts(products) {
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    }

    async getAll() {
        return await this._loadProducts();
    }

    async getById(id) {
        const products = await this._loadProducts();
        return products.find(p => p.id === id);
    }

    async addProduct(productData) {
        const products = await this._loadProducts();
        const newId = products.length ? products[products.length - 1].id + 1 : 1;
        const newProduct = { id: newId, status: true, ...productData };
        products.push(newProduct);
        await this._saveProducts(products);
        return newProduct;
    }

    async updateProduct(id, updatedData) {
        const products = await this._loadProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) return null;

        // Proteger el campo ID
        updatedData.id = id;
        products[index] = { ...products[index], ...updatedData };
        await this._saveProducts(products);
        return products[index];
    }

    async deleteProduct(id) {
        const products = await this._loadProducts();
        const updated = products.filter(p => p.id !== id);
        if (products.length === updated.length) return false;
        await this._saveProducts(updated);
        return true;
    }
}
