let reviewedBefore = false;

const checkIfReviewedBefore = (productId) => {
    Product.findById(productId).then(prodObj => {
        prodObj.populate('reviews').execPopulate().then(populatedProd => {
            if (populatedProd.reviews.length !== 0) {
                populatedProd.reviews.forEach(review => {
                    if (review.author.id.toString() === loggedInUser._id.toString()) {
                        reviewedBefore = true
                        return reviewedBefore
                    }
                })
            }
        })
    }).catch(err => next(err))
}
