const bcrypt = require('bcryptjs');

const User = require('../models/user');

module.exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
    });
};

module.exports.postLogin = (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then( user => {
        if (!user) {
            return res.redirect('/login');
        }
        bcrypt.compare(req.body.password, user.password) //the catch block is triggered for  ANY error, not just password mismatch (so we check again inside then)
        .then(doMatch => {
            //if passwords matched
            if (doMatch) {
                console.log('SIGNED IN!!!');
                req.session.user = user;
                req.session.isLoggedIn = true; //every time someone logs in, their info and login status is saved to their session data
                return req.session.save( err => {
                    console.log(err);
                    res.redirect('/');
                });
            }
            //if they don't match
            console.log('SIGNED IN FAILED!');
            res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/login');
        });
    })
    .catch( err => console.log(err));
};


module.exports.getSignUp = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Sign Up',
        isAuthenticated: false
    });
}

module.exports.postSignUp = (req, res, next) => {
    //checking if user with same email exists
    User.findOne({email: req.body.email})
    .then(userDoc => {

        if (userDoc) {
            return res.redirect('/signup');
        }

        return bcrypt.hash(req.body.password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: req.body.email,
                password: hashedPassword,
                cart: { items: [] }
            });
            return user.save();
        })
        .then(result =>{
            res.redirect('/login');
        });
    })
    .catch(err => {
        console.log(err);
    })
}

module.exports.postLogout = (req, res, next) => {
    req.session.destroy( err => {
        if (err){
            console.log(err);
        }
        console.log('Logged Out. Session entry destroyed.');
        console.log(req.session);
        res.redirect('/');
    });
};