const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const { validateProduct } = require('../middlewares/validators');

router.get('/', productsController.getProducts);
router.post('/', validateProduct, productsController.createProduct);
// ... (otras rutas)

module.exports = router;