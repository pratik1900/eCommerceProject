const express = require("express");
const path = require("path");
const router = express.Router();
//Helper function that provides the root directory
// const rootDir = require("../util/path");

const adminController = require('../controllers/admin');




// /admin/add-product => GET
router.get( '/add-product', adminController.getAddProduct);

// /admin/products => GET
router.get( '/products', adminController.getProducts);

// /admin/add-product => POST
router.post( '/add-product', adminController.postAddProduct);
  
// /admin/edit-product => GET 
router.get('/edit-product/:productId', adminController.getEditProduct);

// /admin/edit-product => POST 
router.post('/edit-product', adminController.postEditProduct);

// /admin/delete-product => POST 
router.post('/delete-product', adminController.postDeleteProduct);



module.exports = router;