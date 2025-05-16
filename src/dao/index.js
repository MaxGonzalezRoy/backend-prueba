const persistence = process.env.PERSISTENCE || 'file'; // 'mongo' o 'file'

let productDao;
let cartDao;

    if (persistence === 'mongo') {
        console.log("📦 Usando persistencia en MongoDB");
        const ProductDaoMongo = (await import('./mongoManagers/product.dao.js')).default;
        const CartDaoMongo = (await import('./mongoManagers/cart.dao.js')).default;
        productDao = new ProductDaoMongo();
        cartDao = new CartDaoMongo();
    } else {
        console.log("📁 Usando persistencia con archivos JSON");
        const ProductManager = (await import('./fileManagers/productManager.js')).default;
        const CartManager = (await import('./fileManagers/cartManager.js')).default;
        productDao = new ProductManager();
        cartDao = new CartManager();
    }

export { productDao, cartDao };
