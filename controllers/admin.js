const Product = require('../models/product'); //importing Product model
const Review = require('../models/review');
const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;


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
    
    if(!image) {

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

    cloudinary.uploader.upload(image.path, (err, result) => {
        if(err){
            throw new Error(err);
        }
        const imageUrl = result.secure_url;
        const imageCloudId = result.public_id; //add image's public_id to product object (will be required to delete old image from CLoudinary when updated with new image)
    
        const product = new Product({
            title: title, 
            price: price, 
            category: category,
            description: description,
            imageUrl: imageUrl,
            imageCloudId: imageCloudId,
            // overallRating: overallRating,
            // num_ratings: num_ratings,
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
        
        //if new image uploaded during editing 
        if(image) {
            cloudinary.uploader.destroy(product.imageCloudId, (err, r) => {
                if(err){
                    throw new Error(err);
                }
                cloudinary.uploader.upload(image.path, (err, result) => {
                    if(err){
                        throw new Error(err);
                    }
                    product.imageUrl = result.secure_url;
                    product.imageCloudId = result.public_id;

                    return product.save()
                    .then( result => {
                        console.log('UPDATED PRODUCT!');
                        res.redirect("/admin/products");
                    });
                })
            });
        }
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
            next(new Error('Product does not exist!'));
        }
        cloudinary.uploader.destroy(product.imageCloudId, (err, r) => {
            if(err){
                next(err);
            }
            Product.deleteOne({_id: prodId, userId: req.user._id})
            .then( result => {
                console.log('PRODUCT DESTROYED');

                //Delete Associated Reviews
                Review.deleteMany({
                    "product.id" : prodId
                })
                .then(result => {
                    console.log('Associated Reviews Destroyed.');
                    res.redirect('/admin/products')
                }).catch(err => {
                    next(err)
                });
            })
        })
        .catch( err => {
            // res.status(500).json({
            //     message: "Deleting product failed"
            // });
            // res.redirect('/admin/products');
            next(err);
        });
    });
};
