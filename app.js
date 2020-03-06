const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const errorController = require('./controllers/error');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session); //returns a constructor

const User = require('./models/user');

const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://pbose:kjnptGrNoNUFfHEW@cluster0-ntjvz.mongodb.net/shop?retryWrites=true&w=majority';
const app = express();

// app.set("view engine", "pug");
app.set("view engine", "ejs");

//creating new store for storing sessions in the DB (as opposed to storing in memory which is the default)
const mongoStore = new MongoDBStore({
    uri: MONGO_URI,
    collection: 'sessions'
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static( path.join(__dirname, 'public') ));
//session middleware
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: mongoStore
}));

//When logged in,for every request, req.user (a mongoose object with all mongoose methods) is created using the _id stored in session user DB data
//this object will persist only for the duration of a request, but it is recreated for every request using persistent data(session DB user data) 
app.use( (req,res,next) => {
    if(!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then( user => {
        req.user = user; //user is a mongoose obj with all methods
        next();
    })
    .catch( err => console.log(err));
});

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


//Plugging in routers from Routing files
app.use('/admin', adminRoutes); //all admin routes will start with /admin/
app.use(shopRoutes);
app.use(authRoutes);


//A Catch-all route for unhandled requests [ .use() will handle requests irrespective of their verb]
app.use(errorController.get404);


mongoose.connect(MONGO_URI)
.then(result => {
    app.listen(3000, () => {
        console.log('Server Started!');
    })
})
.catch(err => console.log(err));
