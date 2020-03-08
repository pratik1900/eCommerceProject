const bcrypt = require('bcryptjs');
const nodemailer= require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}));

module.exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: req.flash('error') //only if it exists, else falsy
    });
};

module.exports.postLogin = (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then( user => {
        if (!user) {
            req.flash('error', "Invalid E-mail or Password.");
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
            req.flash('error', "Invalid E-mail or Password.");
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
        errorMessage: req.flash('error')
    });
}

module.exports.postSignUp = (req, res, next) => {
    //checking if user with same email exists
    User.findOne({email: req.body.email})
    .then(userDoc => {

        if (userDoc) {
            req.flash('error', "E-mail exists already, please pick a different one.");
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
            res.redirect('/login'); //don't redirect after email is sent(in a then block), slows down app (do it like this, as the sending of mail doesnt have to be finished before you redirect, these are independent tasks)
            return transporter.sendMail({   //returns promise
                to: req.body.email,
                from: 'shop@node-complete.com',
                subject: 'Sign Up Complete',
                html: '<h1> You Successfully signed up!. <h1>'
            });
        })
        .catch(err => {
            console.log(err);
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