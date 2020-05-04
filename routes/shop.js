const express = require("express");
const path = require("path");
const router = express.Router();

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth'); //middleware that checks Log-in status


//Index page GET
router.get( '/', shopController.getIndex);

// /products => GET
router.get( '/products', shopController.getProducts);

// /products/category/xxxxx => GET
router.get( '/products/category/:categoryName', shopController.getCategoryProducts);

// /products/xxxxxx => GET
router.get('/products/:productId', shopController.getProduct);

// /cart => GET
router.get( '/cart', isAuth, shopController.getCart);

// /cart => POST
router.post( '/cart', isAuth, shopController.postCart);

// /cart-delete-item => POST
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

// /orders => GET
router.get( '/orders', isAuth, shopController.getOrders);

// /create-orders => POST
router.post( '/create-order', isAuth, shopController.postOrders);

// /checkout => GET
router.get( '/checkout', isAuth, shopController.getCheckout);

// /orders/orderId => GET
router.get('/orders/:orderId', isAuth, shopController.getInvoice)

module.exports = router;

  