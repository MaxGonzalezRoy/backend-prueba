const ProductService = require('../services/product.service');
const productService = new ProductService();

exports.getProducts = async (req, res, next) => {
    try {
        const result = await productService.getAllProducts(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.createProduct = async (req, res, next) => {
    try {
        const newProduct = await productService.createProduct(req.body);
        res.status(201).json({
            success: true,
            product: newProduct
        });
    } catch (error) {
        next(error);
    }
};

// ... (otros métodos del controlador)