const fs = require('fs').promises;
const path = require('path');

class ProductManager {
    constructor(filePath) {
        this.path = filePath || path.join(__dirname, '../data/products.json');
        this.products = [];
        this.lastId = 0;
        this.initialize();
    }

    async initialize() {
        try {
            await this.ensureFileExists();
            await this.loadProducts();
            console.log('✅ ProductManager initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing ProductManager:', error);
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
            throw new Error(`Failed to ensure file exists: ${error.message}`);
        }
    }

    async loadProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            this.products = JSON.parse(data);
            this.lastId = this.products.length > 0 
                ? Math.max(...this.products.map(p => p.id)) 
                : 0;
        } catch (error) {
            throw new Error(`Failed to load products: ${error.message}`);
        }
    }

    async saveProducts() {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.products, null, 2));
        } catch (error) {
            throw new Error(`Failed to save products: ${error.message}`);
        }
    }

    validateProduct(product, isUpdate = false) {
        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
        const numberFields = ['price', 'stock'];
        const stringFields = ['title', 'description', 'code', 'category'];

        // Validar campos requeridos
        if (!isUpdate) {
            for (const field of requiredFields) {
                if (product[field] === undefined || product[field] === null) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }
        }

        // Validar tipos de datos
        for (const field of numberFields) {
            if (product[field] !== undefined && (isNaN(product[field]) || product[field] < 0)) {
                throw new Error(`Invalid value for ${field}: must be a positive number`);
            }
        }

        for (const field of stringFields) {
            if (product[field] !== undefined && typeof product[field] !== 'string') {
                throw new Error(`Invalid value for ${field}: must be a string`);
            }
        }

        // Validar thumbnails si existe
        if (product.thumbnails && (!Array.isArray(product.thumbnails) || 
            product.thumbnails.some(t => typeof t !== 'string'))) {
            throw new Error('thumbnails must be an array of strings');
        }
    }

    async getProducts(limit = 0, page = 1, query = {}, sort = {}) {
        try {
            let filteredProducts = [...this.products];

            // Filtrar por query
            if (query.category) {
                filteredProducts = filteredProducts.filter(
                    p => p.category.toLowerCase() === query.category.toLowerCase()
                );
            }

            // Ordenar
            if (sort.price) {
                filteredProducts.sort((a, b) => 
                    sort.price === 'asc' ? a.price - b.price : b.price - a.price
                );
            }

            // Paginación
            const startIndex = (page - 1) * limit;
            const endIndex = limit ? startIndex + limit : filteredProducts.length;
            const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

            return {
                total: filteredProducts.length,
                limit: limit || filteredProducts.length,
                page,
                products: paginatedProducts
            };
        } catch (error) {
            throw new Error(`Failed to get products: ${error.message}`);
        }
    }

    async getProductById(id) {
        try {
            id = Number(id);
            if (isNaN(id)) throw new Error('Product ID must be a number');

            const product = this.products.find(p => p.id === id);
            if (!product) throw new Error(`Product with ID ${id} not found`);
            
            return product;
        } catch (error) {
            throw new Error(`Failed to get product by ID: ${error.message}`);
        }
    }

    async addProduct(product) {
        try {
            this.validateProduct(product);

            if (this.products.some(p => p.code === product.code)) {
                throw new Error(`Product with code "${product.code}" already exists`);
            }

            const newProduct = {
                ...product,
                id: ++this.lastId,
                status: product.status !== undefined ? product.status : true,
                thumbnails: product.thumbnails || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.products.push(newProduct);
            await this.saveProducts();
            
            return newProduct;
        } catch (error) {
            throw new Error(`Failed to add product: ${error.message}`);
        }
    }

    async updateProduct(id, updatedFields) {
        try {
            id = Number(id);
            if (isNaN(id)) throw new Error('Product ID must be a number');
            if (updatedFields.id) throw new Error("Cannot update product ID");

            const index = this.products.findIndex(p => p.id === id);
            if (index === -1) throw new Error(`Product with ID ${id} not found`);

            this.validateProduct(updatedFields, true);

            const updatedProduct = {
                ...this.products[index],
                ...updatedFields,
                updatedAt: new Date().toISOString()
            };

            // Validar que el código no esté duplicado (excepto para este producto)
            if (updatedFields.code && 
                this.products.some(p => p.code === updatedFields.code && p.id !== id)) {
                throw new Error(`Product with code "${updatedFields.code}" already exists`);
            }

            this.products[index] = updatedProduct;
            await this.saveProducts();

            return updatedProduct;
        } catch (error) {
            throw new Error(`Failed to update product: ${error.message}`);
        }
    }

    async deleteProduct(id) {
        try {
            id = Number(id);
            if (isNaN(id)) throw new Error('Product ID must be a number');

            const initialLength = this.products.length;
            this.products = this.products.filter(p => p.id !== id);
            
            if (this.products.length === initialLength) {
                throw new Error(`Product with ID ${id} not found`);
            }

            await this.saveProducts();
            return true;
        } catch (error) {
            throw new Error(`Failed to delete product: ${error.message}`);
        }
    }

    async getCategories() {
        try {
            const categories = [...new Set(this.products.map(p => p.category))];
            return categories;
        } catch (error) {
            throw new Error(`Failed to get categories: ${error.message}`);
        }
    }
}

module.exports = ProductManager;