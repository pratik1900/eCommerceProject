// require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require('fs');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session); //returns a constructor
const csrf = require('csurf'); //initialize after session middleware, and body parser initialization, before routes plug-in
const flash = require('connect-flash'); //initialize after session middleware
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cloudinary = require('cloudinary').v2;


const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const User = require('./models/user');

const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-ntjvz.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
const app = express();
app.set("view engine", "ejs");

const csrfProtection = csrf();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


//===================================================
//Multer config - configuring file storage and naming
//===================================================

// const fileStorage = multer.memoryStorage();
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname );
    }
});

//Multer config - configuring file validation
const fileFilter = (req, file, cb) => {
    if (file.mimetype ==='image/png'  || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/jpeg') {
            cb(null, true);     
    } else {   
            cb(null, false);
    }
};

//for logging data into a file(used with morgan)
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a'}
)


app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')); // storage - takes the storage configuration object, single - for single file in form; 'image' - name of the input field in the form that corresponds to the file
app.use(express.static( path.join(__dirname, 'public') ));
app.use('/images', express.static( path.join(__dirname, 'images') ));
app.use(helmet());
app.use(compression());
app.use(morgan('combined', {stream: accessLogStream} ));


//========================================
//SESSION CONFIG
//========================================

//creating new store for storing sessions in the DB (as opposed to storing in memory which is the default)
const mongoStore = new MongoDBStore({
    uri: MONGO_URI,
    collection: 'sessions'
});

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
        if(!user){  //extra precaution
            return next();
        }
        req.user = user; //user is a mongoose obj with all methods
        next();
    })
    .catch( err => {
        throw new Error(err);
    });
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

app.get('/500', errorController.get500);
//A Catch-all route for unhandled requests [ .use() will handle requests irrespective of their verb]
app.use(errorController.get404);

//error handling middleware
app.use( (error, req, res, next) => {
    console.log(error);
    res.redirect('/500');
});

app.use((req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=2592000");
    res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
    next()
})


mongoose.connect(MONGO_URI, { useNewUrlParser: true,  useUnifiedTopology: true})
.then(result => {
    app.listen(process.env.PORT || 3000, () => {
        console.log('Server Started!');
    })
})
.catch(err => console.log(err));
