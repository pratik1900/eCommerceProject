const Product = require('../models/product'); //importing Product model/constructor
// const Cart = require('../models/cart');//importing Cart model/constructor

//For displaying the Index page
module.exports.getIndex = (req, res, next) => {
    Product.fetchAll()
    .then( products => {
        res.render('shop/index', {
            prods: products, 
            pageTitle: "Index", 
            path: "/"
        });
    })
    .catch( err => console.log(err));
}

//For displaying the Products page
module.exports.getProducts = (req, res, next) => {
    Product.fetchAll()
    .then( products => {
        res.render('shop/product-list', {
            prods: products, 
            pageTitle: "All Products", 
            path: "/products"
        });
    })
    .catch( err => console.log(err));
}

//For displaying a single product details
module.exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then( product => {
        res.render('shop/product-detail', {
            pageTitle: product.title,
            product: product,
            path: '/products'
        });
    })
    .catch( err => console.log(err) );
}

//Logic for rendering and displaying Cart items
module.exports.getCart = (req, res, next) => {
    req.user.getCart()
    .then( products => {
        res.render('shop/cart', {
            pageTitle: 'Your Cart',
            path: '/cart',
            products: products
        });
    })
    .catch( err => console.log(err));
}

//adding an item to cart
module.exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product
    .findById(prodId)
    .then( product => {
        return req.user.addToCart(product);
    })
    .then( result => {
        console.log('Added to cart!');
        res.redirect('/cart');
    })
    .catch( err => console.log(err));
}

module.exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    
    req.user.deleteItemFromCart(prodId)
    .then( result => {
        console.log('Product Deleted from cart');
        res.redirect('/cart');
    })
    .catch( err => console.log(err))
};

module.exports.getOrders = (req, res, next) => {
    req.user.getOrders()
    .then( orders => {
        console.log(orders);
        res.render('shop/orders', {
            pageTitle: 'Your Orders',
            path: '/orders',
            orders: orders
        });
    })
    .catch(err => console.log(err))
}

module.exports.postOrders = (req, res, next) => {
    req.user.addOrder()
    .then( result => {
        console.log('Items Ordered, removed from cart and added to order history!');
        res.redirect('/orders');
    })
    .catch(err => console.log(err));
}


module.exports.getCheckout = (req, res, next) => {
    res.render('/shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
}