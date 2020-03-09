require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session); //returns a constructor
const csrf = require('csurf'); //initialize after session middleware, and body parser initialization, before routes plug-in
const flash = require('connect-flash'); //initialize after session middleware

const User = require('./models/user');

const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://pbose:kjnptGrNoNUFfHEW@cluster0-ntjvz.mongodb.net/shop?retryWrites=true&w=majority';
const app = express();
const csrfProtection = csrf();

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

app.use(flash()); //has to be after session middleware


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



//adds local variables (available to views for current req-res cycle) for every request
//has to be placed above route plug-ins
app.use(csrfProtection);

app.use( (req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken(); //generates a new token
    next();
});


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
