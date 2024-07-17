const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const pool = require('../config/db');

const userExists = async(email) => {
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
            const newUser = await pool.query('INSERT INTO users (password, first_name, last_name, telephone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *', [hashedPassword, first_name, last_name, telephone, email]);
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
        return done(null, user)
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

module.exports = { createUser, passport };