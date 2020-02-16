const mongoDb = require('mongodb');
const getDb = require('../util/database').getDb;


const User = function(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart? cart : { items: [] };   //{ items: [] }
    this._id = id;
}

//non-static
User.prototype.save = () => {
    const db = getDb();
    db.collections('users')
    .insertOne(this);
}

//non-static (dont use arrow, this involved)
User.prototype.addToCart = function (product) {

    //checking if item already present in cart, will return -1 if not found
    const cartProductIndex = this.cart.items.findIndex( cp => {
        return cp.productId.toString() === product._id.toString();
    });

    let newQuantity = 1; //assuming product not found in cart
    const updatedCartItems = [...this.cart.items];
    
    //already present
    if(cartProductIndex >=0) {
        newQuantity = updatedCartItems[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({productId: new mongoDb.ObjectId(product._id), quantity: newQuantity});
    }
    
    const updatedCart = { items:updatedCartItems };
    const db = getDb();
    
    return db
    .collection('users')
    .updateOne( 
        { _id: new mongoDb.ObjectId(this._id) }, 
        { $set: {cart:updatedCart} } 
    );
}

//non-static
User.prototype.getCart = function() {   //1) lists product Ids of cart items (2) queries product collection using that ID list (3)queries cart collection for quantity of each item, and returns an object containing each individual product data along with the corresponding quantity
    const db = getDb();

    //creating array containing product ids of all items in cart
    const productIds = this.cart.items.map( i => {
        return i.productId;
    });

    return db.collection('products').find( {_id: {$in: productIds}} ).toArray()
    .then( products => {
        return products.map( p => {
            return {...p, quantity: this.cart.items.find( i => {
                return i.productId.toString() === p._id.toString();
            }).quantity };
        });
    })
    return this.cart;
}

//non-static

User.prototype.deleteItemFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter( item => {
        return item.productId.toString() !== productId.toString();
    });

    const db = getDb();
    return db
    .collection('users')
    .updateOne( 
        { _id: new mongoDb.ObjectId(this._id) }, 
        { $set: {cart: {items: updatedCartItems} } } 
    );
};

//non-static
User.prototype.addOrder = function() {
    const db = getDb();
    return this.getCart()
    .then( products => {
        const order = {
            items: products,
            user: {
                _id: new mongoDb.ObjectId(this._id),
                name: this.name
            }
        };
        return db.collection('orders').insertOne(order);
    })
    .then( result => {
        this.cart = { items: [] };
        return db.collection('users').updateOne( 
            {_id: new mongoDb.ObjectId(this._id)},
            { $set: { cart: { items:[] } } } 
        );
    })
    .catch( err => console.log(err));
}

//non-static
User.prototype.getOrders = function() {
    const db = getDb();

    return db.collection('orders')
    .find({'user._id' : new mongoDb.ObjectId(this._id)})
    .toArray();
}

//static
User.findById = (userId) => {
    const db = getDb();
    return db
    .collection('users')
    .find( {_id: new mongoDb.ObjectID(userId)} )
    .next(); //find returns a cursor
}

module.exports = User;