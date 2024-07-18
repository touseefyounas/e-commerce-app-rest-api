const express = require('express');
const { createUser, 
        passport, 
        isAuthenticated, 
        getUserById, 
        updateUserById, 
        deleteUserById} = require('../config/auth');

const router = express.Router();


router.post('/register', createUser);

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get(':userId', isAuthenticated, getUserById);

router.put(':userId', isAuthenticated, updateUserById);

router.delete(':userId', isAuthenticated, deleteUserById);


module.exports = router;


