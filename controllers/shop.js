const Product = require('../models/product'); //importing Product model
const Order = require('../models/order');//importing Order model 

//For displaying the Index page
module.exports.getIndex = (req, res, next) => {
    Product.find()
    .then( products => {
        res.render('shop/index', {
            prods: products, 
            pageTitle: "Index", 
            path: "/"
        });
    })
    .catch( err => {
        next(new Error(err));
    });
}

//For displaying the Products page
module.exports.getProducts = (req, res, next) => {
    Product.find()
    .then( products => {
        res.render('shop/product-list', {
            prods: products, 
            pageTitle: "All Products", 
            path: "/products"
        });
    })
    .catch( err => {
        next(new Error(err));
    });
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
    .catch( err => {
        next(new Error(err));
    });
}

//Logic for rendering and displaying Cart items
module.exports.getCart = (req, res, next) => {
    // console.log(req.session.user);
    req.user
    .populate('cart.items.productId')
    .execPopulate() //helps to return a promise
    .then( user => {
        const products = user.cart.items;
        res.render('shop/cart', {
            pageTitle: 'Your Cart',
            path: '/cart',
            products: products
        });
    })
    .catch( err => {
        next(new Error(err));
    });
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
    .catch( err => {
        next(new Error(err));
    });
}

module.exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    
    req.user.removeFromCart(prodId)
    .then( result => {
        console.log('Product Deleted from cart');
        res.redirect('/cart');
    })
    .catch( err => {
        next(new Error(err));
    });
};

module.exports.getOrders = (req, res, next) => {
    Order.find({'user.userId' : req.user._id})
    .then( orders => {
        console.log(orders);
        res.render('shop/orders', {
            pageTitle: 'Your Orders',
            path: '/orders',
            orders: orders
        });
    })
    .catch( err => {
        next(new Error(err));
    });
}

module.exports.postOrders = (req, res, next) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {

        //creating the correct format to be used in Order instance creation (in accordance to the order model)
        const products = user.cart.items.map(i => {
            return {product: { ...i.productId._doc } , quantity: i.quantity}
        });

        const order = new Order({
            products: products,

            user: {
                email: req.user.email,
                userId: req.user._id
            }
        });
        order.save();
    })
    .then( result => {
        req.user.clearCart();
    })
    .then(() => {
        console.log('Items Ordered, removed from cart and added to order history!');
        res.redirect('/orders');
    })
    .catch( err => {
        next(new Error(err));
    });
}


module.exports.getCheckout = (req, res, next) => {
    res.render('/shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
}