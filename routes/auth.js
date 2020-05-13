const express = require("express");
const router = express.Router();
const authController = require('../controllers/auth');
const User = require('../models/user')
const { check, body } = require('express-validator'); //check - checks for a field anywhere: body, params, cookies, etc. body - specific checker that checks for a field value present in just the body

router.get('/login', authController.getLogin);
router.post(
    '/login', 
    [
        body('email', "Invalid E-mail.")
        .isEmail()
        .normalizeEmail(),

        body('password', "Invalid password.")
        .isAlphanumeric()
        .isLength(5)
        .trim()
    ], 
    authController.postLogin
    );

router.get('/signup', authController.getSignUp);

router.post(
    '/signup', 
    [   body('username')
        .isAlphanumeric()
        .withMessage('Username can contain only alphabets and numbers.')
        .trim()
        .custom((value, {req}) => { //this can be done here, or in the controller (preferable, as this deals with logic, not input mistakes. Keeping it here as an example of custom validators)
            return User.findOne({username: value})
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('Username exists already, please pick a different one.');   //validator 
                }
            });
        }),

        check('email')
        .isEmail()
        .withMessage('Please Enter a valid Email.')    //specific error msg for e-mail validation fail
        .normalizeEmail()
        .custom((value, {req}) => { //this can be done here, or in the controller (preferable, as this deals with logic, not input mistakes. Keeping it here as an example of custom validators)
            return User.findOne({email: value})
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('E-mail exists already, please pick a different one.');   //validator 
                }
            });
        }),

        body('password', 'Please enter a password at least 5 characters long, containing both alphabets and numbers') //when a default error msg has to be used (as opposed to specific ones for failure of different checks, we pass it as the second argument)
        .isLength({min: 5})
        .isAlphanumeric()
        .trim(),

        body('confirmPassword')
        .trim()
        .custom((value, {req} ) => {    //custom validator
            if(value !== req.body.password) {
                throw new Error('Passwords have to match!');
            }
            return true;
        })
    ],
    authController.postSignUp
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;