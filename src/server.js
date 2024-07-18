require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./config/auth').passport; 

const app = express();

const userRouter = require('./routes/users');
const productRouter = require('./routes/products');

const PORT = process.env.PORT || 3000;

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false
  }));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

app.use('/users', userRouter);
app.use('/products', productRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`);
})