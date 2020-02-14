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
    .then( cart => {
        return cart.getProducts(); //Another Sequelize "magic" function, usable because of association 
    })
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
        console.log(result);
        console.log('Added to cart!');
        res.redirect('/cart');
    })
    .catch( err => console.log(err));
    // let fetchedCart;
    // req.user.getCart()
    // .then( cart => {
    //     fetchedCart = cart; //making it available to parent scope
    //     //checking to see if item already present in cart, if yes, just increase quantity
    //     return cart.getProducts({where: {id:prodId} })
    // })
    // .then( products => {
    //     let product;
    //     if(products.length > 0){
    //         product = products[0];
    //     }
    //     let newQuantity = 1;
    //     if(product) {
    //         const oldQuantity = product.cartItem.quantity;
    //         newQuantity = oldQuantity + 1;
    //         return fetchedCart.addProduct(product, { through: {quantity: newQuantity} } );
    //     }
    //     return Product.findByPk(prodId)
    //     .then( product => {
    //         return fetchedCart.addProduct(product, { through: { quantity: newQuantity } } );
    //     })
    //     .catch( err => console.log(err));
    // })
    // .then( () => {
    //     res.redirect('/cart');
    // })
    // .catch( err => console.log(err))
}

module.exports.postCartDelete = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId, product => {
        Cart.deleteProduct(prodId, product.price);
        res.redirect('/cart');
    });
};

module.exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders'
    });
}


module.exports.getCheckout = (req, res, next) => {
    res.render('/shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
}