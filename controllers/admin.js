const Product = require('../models/product'); //importing Product model
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file');

// displays addproduct form
module.exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product", 
        path:'/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: {}
    });
};

//Add new entry to DB
module.exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const category = req.body.category;
    const description = req.body.description;
    
    console.log('IMAGE',image);
    if(!image) {
        console.log('not an image block entered');

        res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product", 
            path:'/admin/add-product',
            product: {
                title: title,
                price: price, 
                category: category,
                description: description
            },
            editing: false,
            hasError: true,
            errorMessage: 'Attached file is not an image!',
            validationErrors: {}
        });
    }

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product", 
            path:'/admin/add-product',
            product: {
                title: title,
                price: price, 
                category: category,
                description: description
            },
            editing: false,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.mapped()
        });
    }
    const imageUrl = image.path;
    
    const product = new Product({
        title: title, 
        price: price, 
        category: category,
        description: description,
        imageUrl: imageUrl,
        userId: req.user._id
    });

    product.save()
    .then( product => {
        console.log('Created Product!');
        res.redirect('/admin/products');
    })
    .catch( err => {
        next(new Error(err));
    });
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
            editing: true,
            hasError: false,
            errorMessage: null,
            validationErrors: {}
        });
    })
    .catch( err => {
        next(new Error(err));
    });
};

//Update DB entry
module.exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;

    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const category = req.body.category;
    const description = req.body.description;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Edit Product", 
            path:'/admin/edit-product',
            product: {
                title: title,
                price: price, 
                category: category,
                description: description,
                imageUrl: imageUrl,
                _id: prodId
            },
            editing: true,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.mapped()
        });
    }
    Product.findById(prodId)
    .then(product => {
        //checking if user trying to edit product actually created it
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = title; 
        product.price = price; 
        product.category = category;
        product.description = description; 
        
        //if new image uploaded durig editing 
        if(image) {
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        
        return product.save()
        .then( result => {
            console.log('UPDATED PRODUCT!');
            res.redirect("/admin/products");
        });
    })
    .catch( err => {
        next(new Error(err));
    });
};

module.exports.getProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
    .then( products => {
        res.render('admin/products', {
            prods: products, 
            pageTitle: "Admin Products", 
            path: "/admin/products"
        });
    })
    .catch( err => {
        next(new Error(err));
    });
};


module.exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;

    //deleting the product image, then the product entry in DB
    Product.findById(prodId)
    .then(product => {
        if(!product){
            next(err);
        }
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({_id: prodId, userId: req.user._id})
    })
    .then( () => {
        console.log('PRODUCT DESTROYED');
        res.status(200).json({
            message: "Product Deleted Successfully"
        });
    })
    .catch( err => {
        res.status(500).json({
            message: "Deleting product failed"
        });
    });
};