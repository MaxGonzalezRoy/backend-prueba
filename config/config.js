const path = require('path');

module.exports = {
    app: {
        port: process.env.PORT || 8080,
        env: process.env.NODE_ENV || 'development',
        frontendUrl: process.env.FRONTEND_URL
    },
    files: {
        products: path.join(__dirname, '../data/products.json'),
        carts: path.join(__dirname, '../data/carts.json')
    },
    session: {
        secret: process.env.SESSION_SECRET,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }
    }
};