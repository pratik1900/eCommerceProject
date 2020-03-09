const bcrypt = require('bcryptjs');
const nodemailer= require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SENDGRID_TOKEN
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

module.exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: req.flash('error') //only if it exists, else falsy
    });
};

module.exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({email: req.body.email})
        .then(user => {
            if(!user) {
                req.flash('error', 'No account with that e-mail found!');
                res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result => {
            res.redirect('/');
            transporter.sendMail({   //returns promise
                to: req.body.email,
                from: 'shop@node-complete.com',
                subject: 'Password Reset',
                html: `
                    <p>You requested a password reset. 
                    Click this <a href='http://localhost:3000/reset/${token}'>link</a> to reset your password.
                `
            });
        })
        .catch(err => {
            console.log(err);
        });
    })
};

module.exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: req.flash('error'), //only if it exists, else falsy
            userId: user._id.toString(),
            passwordToken: token
        });
    })
    .catch(err => {
        console.log(err);
    })
};


module.exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.newPassword;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken, 
        resetTokenExpiration: {$gt: Date.now()},
        _id: userId
    })
    .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(result => {
        res.redirect('/login');
    })
    .catch(err => {
        console.log(err);
    })

}