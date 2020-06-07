const Product = require('../models/product');
const Review = require('../models/review');


// module.exports = (orders, loggedInUser) => {
//     let newOrders = orders.map(order => {
//         let newProds = order.products.map(p => {
//             Product.findById(p.product._id)
//             .then(prodObj => { 
//                 return prodObj.populate('reviews').execPopulate()
//             })
//             .then(populatedProd => { 
//                 if(populatedProd.reviews.length !== 0){ 
//                     for(let review of populatedProd.reviews){
//                         if(review.author.id.toString() === loggedInUser._id.toString() ) {
//                             console.log("BINGOOO");
//                             p["reviewedBefore"] = true 
//                             break;
//                         } 
//                     }
//                 }
//             })
//             return p;
//         })
//         console.log("newProds:", newProds);
//         order.products = newProds
//         return order;
//     })
//     orders = newOrders
//     console.log("newOrders:", newOrders);
//     // console.log(orders[1].products);
// }

module.exports = (orders, loggedInUser) => {
    Review.find({ 'author.id' : loggedInUser._id}, { '_id' : 0, 'product' : 1})
    .then(reviews => {
        productsReviewed = reviews.map(review => review.product.id)
        orders = orders.map(order => {
            order.products = order.products.map(prod => {
                for(let reviewedProdId of productsReviewed){
                    if(reviewedProdId.toString() === prod.product._id.toString()){
                        // console.log('=======================');
                        // console.log('MATCHED:',reviewedProdId, prod.product._id);
                        // console.log('=======================');
                        prod['reviewdBefore'] = true
                        console.log(prod);
                        break;
                    } 
                    // else {
                    //     console.log('=======================');
                    //     console.log('NO MATCH:',reviewedProdId, prod.product._id);
                    //     console.log('=======================');
                    // }
                }
                return prod
            })


            return order
        })
        // console.log(orders)
    })
}

