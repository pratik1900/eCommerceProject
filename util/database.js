const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://pbose:kjnptGrNoNUFfHEW@cluster0-ntjvz.mongodb.net/shop?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
    .then( client => {
        console.log('Connected to MongoDB Server!');
        _db = client.db();
        callback();
    })
    .catch( err => {
        console.log(err);
        throw err;
    });
}

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'No Database Found!';
}

module.exports.mongoConnect = mongoConnect;
module.exports.getDb = getDb;