module.exports.buildFilterOptionsObj = (queryObj) => {

    //helper funtion
    function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    let filterOptions = {};

    const category = queryObj.category;
    const maxPrice = queryObj.maxPrice;
    const searchQuery = queryObj.search;
    let minReviewScore = queryObj.minReviewScore;

    //Category Filtering
    if(category) {
        filterOptions = { category : category }
    }

    //Search Query Filtering
    if(searchQuery) {
        const regex = new RegExp(escapeRegex(queryObj.search), "gi");
        filterOptions = {title: regex};
    }

    //Price Filtering
    if(maxPrice) {
        filterOptions = { price: { $lte: maxPrice} }
    }

    //Min Review Score Filtering
    if(minReviewScore){
        if (minReviewScore.length > 1){
            const minReviewScore = Math.min.apply(null, minReviewScore);
        } else {
            minReviewScore = minReviewScore[0]
        }
        filterOptions = { overallRating: { $gte: minReviewScore } }
    }

    //Max Price + Min Review Score Filtering
    if(maxPrice && minReviewScore){
        if (minReviewScore.length > 1){
            const minReviewScore = Math.min.apply(null, minReviewScore);
        } else {
            minReviewScore = minReviewScore[0]
        }
        filterOptions = { price: { $lte: maxPrice}, overallRating: { $gte: minReviewScore } }
    }


    return filterOptions;
}