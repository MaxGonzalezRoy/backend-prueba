const { body, validationResult } = require('express-validator');

exports.validateProduct = [
    body('title').notEmpty().isString().trim().isLength({ min: 3, max: 100 }),
    body('description').notEmpty().isString().trim().isLength({ min: 10 }),
    body('price').isFloat({ min: 0 }),
    body('stock').isInt({ min: 0 }),
    // ... (otras validaciones)
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];