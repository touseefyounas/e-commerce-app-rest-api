const express = require('express');
const { createUser, passport } = require('../config/auth');

const router = express.Router();


router.post('/register', createUser);

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

module.exports = router;


