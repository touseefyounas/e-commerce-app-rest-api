const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const session = require('express-session');

const pool = require('../config/db');

const getCurrentTimeStamp = () => {
    return new Date().toISOString();
}

const userExists = async (email) => {
    const userExist = await pool.query('SELECT * FROM users WHERE email =$1', [email]);
    if (userExist.rows.length>0) {
        return userExist.rows[0];
    } else {
        return false;
    }
}

const createUser = async (req, res) => {
    const { password, first_name, last_name, telephone, email } = req.body;
    const user = await userExists(email);
    if (!user) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const createdAt = getCurrentTimeStamp();
            const newUser = await pool.query('INSERT INTO users (password, first_name, last_name, telephone, created_at, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [hashedPassword, first_name, last_name, telephone, createdAt, email]);
            res.status(201).json(newUser.rows[0]);
        } catch(err) {
            console.log(err.message);
            res.status(500).json({message: 'Server error'});
        }
    } else {
        res.status(400).json({message:'User already exists'});
    }
}

passport.use('local', new LocalStrategy({usernameField: 'email', passwordField: 'password'}, async(email, password, done)=> {
    try {
        const user = await userExists(email);
        if (!user) {
            return done (null, false);
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false);
        }
        return done(null, user);
        

    } catch (err) {
        console.log(err.message);
        return done(err);
    }
}))

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      done(null, user.rows[0]);
    } catch (err) {
      done(err);
    }
  });

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
        //res.redirect('/users/login');
    }
}

const getUserById = async (req, res) => {
    const id = req.params.userId;
    try{
    const user = await pool.query('SELECT * FROM user where id=$1', [id]);
    if (user) {
        res.status(200).json(user.rows[0])
    } else {
        res.status(400).json({message: 'User does not exist'});   
    }
    } catch(err){
        console.log(err.message);
        res.status(500).json({message: 'Server error'});
    }
}

const updateUserById = async(req, res) => {
    const id = req.params.id;
    const { password, first_name, last_name, telephone, email } = req.body;
    const user = await userExists(email);
    if (user) {
        try{
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const modifiedAt = getCurrentTimeStamp();
            const updatedUser = await pool.query('UPDATE user SET password =$1, first_name=$2, last_name=$3, telephone=$4, modified_at=$5, email=$6 WHERE id= $7 RETURNING *', 
                [hashedPassword, first_name, last_name, telephone, modifiedAt, email, id]);
            res.status(201).json(updatedUser.rows[0])
        } catch(err){
            console.log(err.message);
            res.status(500).json({message: 'Server error'});
       }
    } else {
        res.status(400).json({message:"User doesn't exist"})
    }
}

const deleteUserById = async (req, res) => {
    const id = req.params.userId;
    try {
        const deleteUser = await pool.query('DELETE FROM user WHERE id = $1', [id]);
        res.status(200).send(`User deleted with ID: ${id}`)
    } catch(err){
        console.log(err.message);
        res.status(500).json({message: 'Server error'});
    }
}

module.exports = { createUser, 
                    passport, 
                    isAuthenticated, 
                    getUserById, 
                    updateUserById, 
                    deleteUserById};