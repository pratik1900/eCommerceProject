const express = require("express");
const path = require("path");
const router = express.Router();
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth'); //middleware that checks Log-in status



// /admin/add-product => GET
router.get( '/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get( '/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
    '/add-product', 
    [
        body('title')
        .isString()
        .isLength({ min: 3 })
        .trim(),

        body('price')
        .isFloat(),

        body('description')
        .isLength({ min: 3, max: 400 })
        .trim()
    ], 
    isAuth, 
    adminController.postAddProduct
);
  
// /admin/edit-product => GET 
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/edit-product => POST 
router.post(
    '/edit-product', 
    [
        body('title')
        .isString()
        .isLength({ min: 3 })
        .trim(),

        body('price')
        .isFloat(),

        body('description')
        .isLength({ min: 5, max: 400 })
        .trim()
    ],
    isAuth, 
    adminController.postEditProduct
);

// /admin/product/:productId => Delete 
router.delete('/product/:productId', isAuth, adminController.deleteProduct);



module.exports = router;