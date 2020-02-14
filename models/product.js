const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

const Product = function(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectID(id) : null; // checking if id exists or not
    this.userId = userId;
}

//non-static
const save = function() {
    const db = getDb();
    let dbOp;

    //for updating product
    if(this._id) {
        dbOp = db.collection('products').updateOne(
            {_id: this._id},
            { $set: this} );
    }

    //for creating new document
    else {
        dbOp = db.collection('products').insertOne(this);
    }

    return dbOp
    .then( result => console.log(result))
    .catch( err => console.log(err));
}
Product.prototype.save = save;


//static
Product.fetchAll = () => {
    const db = getDb();
    return db.collection('products').find().toArray() //.find() returns a CURSOR, .toArray() iterates over the documents are returns them in an array (loads into RAM - do NOT do for large results)
    .then( products => {
        // console.log(products);
        return products;
    })
    .catch( err => console.log(err))
}

//static
Product.findById = (prodId) => {
    const db = getDb();
    return db
    .collection('products')
    .find({ _id: new mongodb.ObjectID(prodId) })
    .next()
    .then( product => {
        // console.log(product);
        return product;
    })
    .catch( err => console.log(err));
}

//static
Product.deleteById = (prodId) => {
    const db = getDb();
    return db
    .collection('products')
    .deleteOne( {_id: new mongodb.ObjectID(prodId) } )
    .then( result => {
        console.log('Deleted');
    })
    .catch( err => {
        console.log(err);
    });
}

module.exports = Product;