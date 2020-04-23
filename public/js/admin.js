// browser side code

const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    productDOMElement = btn.closest('article');

    fetch('/admin/product/' + prodId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
    .then(result => {
        return result.json();
    })
    .then(data => {
        console.log(data);
        //removing product DOM element
        productDOMElement.remove(); //doesnt work in IE (productDOMElement.parentNode.removeChild(productDOMElement) works everywhere)

    })
    .catch(err => {
        console.log(err);
    })
}