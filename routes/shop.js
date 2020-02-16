const express = require("express");
const path = require("path");
const router = express.Router();

const shopController = require('../controllers/shop');



//Index page GET
router.get( '/', shopController.getIndex);

// /products => GET
router.get( '/products', shopController.getProducts);

// /products/xxxxxx => GET
router.get('/products/:productId', shopController.getProduct);

// /cart => GET
router.get( '/cart', shopController.getCart);

// /cart => POST
router.post( '/cart', shopController.postCart);

// /cart-delete-item => POST
router.post('/cart-delete-item', shopController.postCartDeleteProduct);

// /orders => GET
router.get( '/orders', shopController.getOrders);

// /create-orders => POST
router.post( '/create-order', shopController.postOrders);

// // /checkout => GET
// router.get( '/checkout', shopController.getCheckout);

module.exports = router;

  