//Side Filter Bar Logic

const priceSlider = document.getElementById('maxPriceSlider');
const maxPriceDisplay = document.getElementById('maxPriceDisplay');

maxPriceDisplay.innerHTML = priceSlider.value;  //initial display


priceSlider.addEventListener('input', function() {
    maxPriceDisplay.innerHTML = this.value;
})