const Product = require('../models/product'); //importing Product model


// displays addproduct form
module.exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product", 
        path:'/admin/add-product',
        editing: false
    });
}

//Add new entry to DB
module.exports.postAddProduct = (req, res, next) => {
    const product = new Product(
        req.body.title, 
        req.body.price, 
        req.body.description,
        req.body.imageUrl,
        null, //for product ID
        req.user._id
        );

    product.save()
    .then( product => {
        console.log('Created Product!');
        res.redirect('/admin/products');
    })
    .catch( err => console.log(err));
};

//displays edit product form
module.exports.getEditProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then( product => {
        if(!product) {
            return res.redirect('/');
        }
        res.render("admin/edit-product", {
            pageTitle: "Edit Product", 
            path:'/admin/edit-product',
            product: product,
            editing: true
        });
    })
    .catch( err => console.log(err));
};

//Update DB entry
module.exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;

    const product = new Product(
        req.body.title, 
        req.body.price, 
        req.body.description, 
        req.body.imageUrl, 
        prodId
    );

    product
    .save()
    .then( result => {
        console.log('UPDATED PRODUCT!');
        res.redirect("/");
    })
    .catch( err => console.log(err) )
};

module.exports.getProducts = (req, res, next) => {
    Product.fetchAll()
    .then( products => {
        res.render('admin/products', {
            prods: products, 
            pageTitle: "Admin Products", 
            path: "/admin/products"
        });
    })
    .catch( err => console.log(err) );
    // req.user.getProducts()
    // .then( products => {
        // res.render('admin/products', {
        //     prods: products, 
        //     pageTitle: "Admin Products", 
        //     path: "/admin/products"
        // });
    // })
    // .catch( err => console.log(err));
}


module.exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteById(prodId)
    .then( () => {
        console.log('PRODUCT DESTROYED');
        res.redirect('/admin/products');
    })
    .catch( err => console.log(err));
}