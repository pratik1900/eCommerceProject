const fs = require('fs');
const path = require('path');
const Pdfkit = require('pdfkit');
const filterHelper = require('../util/filterOptionsBuilder');
const cloudinary = require('cloudinary').v2;

const ITEMS_PER_PAGE = 9;

const Product = require('../models/product'); //importing Product model
const Order = require('../models/order');//importing Order model 
const Review = require('../models/review');

//For displaying the Index page
module.exports.getIndex = (req, res, next) => {
    res.render('shop/index', { 
        pageTitle: "Index", 
        path: "/",
        cloudinary: cloudinary
    })
}

//For displaying the Products page
module.exports.getProducts = (req, res, next) => {
    
    const page = Number(req.query.page) || 1;
    let totalItems;

    const filterOpts = filterHelper.buildFilterOptionsObj(req.query);
    
    Product.countDocuments(filterOpts)
    .then(numProducts => {
        totalItems = numProducts;

        return Product.find(filterOpts)
        .skip( (page - 1) * ITEMS_PER_PAGE )
        .limit(ITEMS_PER_PAGE)
    })
    .then( products => {
        res.render('shop/product-list', {
            prods: products, 
            pageTitle: "All Products", 
            path: "/products",
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            cloudinary: cloudinary
        });
    })
    .catch( err => {
        next(new Error(err));
    });
}

//For displaying products of particular category
module.exports.getCategoryProducts = (req, res, next) => {
    const category = req.params.categoryName;
    const page = Number(req.query.page) || 1;
    let totalItems;

    Product.countDocuments({ category: category })
    .then(numProducts => {
        totalItems = numProducts;

        return Product.find({ category: category })
        .skip( (page - 1) * ITEMS_PER_PAGE )
        .limit(ITEMS_PER_PAGE)
    })
    .then( products => {
        res.render('shop/product-list', {
            prods: products, 
            pageTitle: "All Products", 
            path: "/products",
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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
        res.render('shop/order2', {
            pageTitle: 'Your Orders',
            path: '/orders',
            orders: orders,
            loggedInUser: req.user,
            Product: Product
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
    req.user
    .populate('cart.items.productId')
    .execPopulate() //helps to return a promise
    .then( user => {
        const products = user.cart.items;
        let total =0;
        products.forEach( p => {
            total += p.quantity * p.productId.price
        })
        res.render('shop/checkout', {
            pageTitle: 'Checkout',
            path: '/checkout',
            products: products,
            totalSum: total
        });
    })
    .catch( err => {
        next(new Error(err));
    });
}

module.exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    //checking if currently logged in user placed the order
    Order.findById(orderId)
    .then(order => {
        if(!order){
            return next(new Error('No order found.'))
        }
        if(order.user.userId.toString() !== req.user._id.toString()){
            return next(new Error('Unauthorized'));
        }

        const invoiceName = 'invoice-' + orderId + '.pdf';
        const invoicePath = path.join('data', 'invoices', invoiceName);

        const pdfDoc = new Pdfkit(); //readable stream

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

        pdfDoc.pipe(fs.createWriteStream(invoicePath)); //storing the generated pdf on the server
        pdfDoc.pipe(res); //serving generated pdf file to the client

        pdfDoc.fontSize(36).text('Invoice', {italic: true});
        pdfDoc.fontSize(26).text('---------------------------');

        let totalPrice = 0;
        order.products.forEach( prod => {
            totalPrice += prod.quantity * prod.product.price
            pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x $' + prod.product.price);           
        });
        pdfDoc.fontSize(26).text('---------------------------');
        pdfDoc.fontSize(26).text('Total Price: $' + totalPrice);



        pdfDoc.end();
    })
    .catch(err => next(err));
}

//For submitting a product rating

module.exports.postRating = (req, res, next) => {
    const prodId = req.body.productId;
    const submittedRating = Number(req.body.productRating);
    const writtenReview = req.body.reviewContent;

    console.log(submittedRating);
    console.log(writtenReview);

    Product.findById(prodId)
    .then(product => {
        if(!product){
            throw new Error('Product not Found.')
        }
        const review = new Review({
            text: writtenReview,
            createdAt: new Date().toISOString().slice(0, 10),
            author: {
                id: req.user._id,
                username: req.user.username
            },
            product: {
                id: prodId
            },
            rating: submittedRating
        }); 
        review.save()
        .then(review => {
            product.overallRating = ((product.overallRating * product.num_ratings) + submittedRating) / (product.num_ratings + 1);
            product.num_ratings += 1;
            product.reviews.push(review._id)
            product.save()
            .then(result => {
                res.redirect('/products');
            })
        })
    })
    .catch((err) => {
        next(err)
    });  
}


