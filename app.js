const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const errorController = require('./controllers/error');

const User = require('./models/user');

const mongoConnect = require('./util/database').mongoConnect;



const app = express();

// app.set("view engine", "pug");
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static( path.join(__dirname, 'public') ));

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use( (req, res, next) => {
    User.findById('5e43ea8da81b3115480c9ae7')
    .then( user => {
        req.user = new User(user.name, user.email, user.cart, user._id); //storing user - invoking 'new' to gain access to model methods
        next();
    })
    .catch( err => console.log(err));
});

//Plugging in routers from Routing files
app.use('/admin', adminRoutes); //all admin routes will start with /admin/
app.use(shopRoutes);


//A Catch-all route for unhandled requests [ .use() will handle requests irrespective of their verb]
app.use(errorController.get404);


mongoConnect( () => {
    app.listen(3000, () => console.log('Server is Running!'));
});
