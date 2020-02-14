const mongoDb = require('mongodb');
const getDb = require('../util/database').getDb;


const User = function(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;   //{ items: [] }
    this._id = id;
}

//non-static
User.prototype.save = () => {
    const db = getDb();
    db.collections('users')
    .insertOne(this);
}

//non-static
User.prototype.addToCart = (product) => {
    // const cartProduct = this.cart.items.findIndex( cp => {
    //     return cp._id === product._id;
    // }); //will return -1 if not found
    
    const updatedCart = { items: [ {...product, quantity: 1} ] };
    const db = getDb();
    
    return db
    .collection('users')
    .updateOne( 
        { _id: new mongoDb.ObjectId(this._id) }, 
        {$set: {cart: updatedCart }} 
    );
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