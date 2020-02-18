const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const errorController = require('./controllers/error');

const User = require('./models/user');

const mongoose = require('mongoose');

const app = express();

// app.set("view engine", "pug");
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static( path.join(__dirname, 'public') ));

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use( (req, res, next) => {
    User.findById('5e4acf3b32ac9122c09ebc01')
    .then( user => {
        req.user = user; //user is a mongoose obj with all methods
        next();
    })
    .catch( err => console.log(err));
});

//Plugging in routers from Routing files
app.use('/admin', adminRoutes); //all admin routes will start with /admin/
app.use(shopRoutes);


//A Catch-all route for unhandled requests [ .use() will handle requests irrespective of their verb]
app.use(errorController.get404);


mongoose.connect('mongodb+srv://pbose:kjnptGrNoNUFfHEW@cluster0-ntjvz.mongodb.net/shop?retryWrites=true&w=majority')
.then(result => {
    User.findOne()
        .then( user => {
            if (!user) {
                const user = new User({
                    name: 'Pratik',
                    email: 'pratik@bose.com',
                    cart: { items: [] }
                });
                user.save();
            }
        })
        .catch(err => console.log(err));

    app.listen(3000, () => {
        console.log('Server Started!');
    })
})
.catch(err => console.log(err));
