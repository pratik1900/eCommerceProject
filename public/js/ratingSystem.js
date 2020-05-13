let finalRating;
const allRatingBoxes = document.querySelectorAll('.ratings');   //returns the rating boxes from all the product-specific modals


allRatingBoxes.forEach(ratingBox =>{
    let ratingFormField = ratingBox.parentElement.parentElement.querySelector('#productRating');    //get corresponding rating form field
    let stars = ratingBox.children;
    for(let x = 0; x < stars.length; x++) {
        stars[x].addEventListener('click', function(e){ 
            let clickedIndex;
            if(stars[x] === e.target){
                clickedIndex = x
            }

            finalRating = clickedIndex + 1;
            ratingFormField.value = Number(finalRating);

            // For Colour filling/unfilling of the stars:

            if(!stars[x].classList.contains('fas') ) {
                for(let star of stars) {
                    star.classList.remove('far');
                    star.classList.add('fas');
                    if(star === e.target){
                        break;
                    }
                }
            } else {
                for(let x=clickedIndex+1; x<stars.length; x++) {
                    stars[x].classList.remove('fas');
                    stars[x].classList.add('far');
                }
            }
        })
    }
})