require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('./config/auth').passport; 
const store = new session.MemoryStore();

const app = express();

const userRouter = require('./routes/users');
const productRouter = require('./routes/products');
const cartRouter = require('./routes/userCart');
const checkoutRouter = require('./routes/checkout');

const PORT = process.env.PORT || 3000;

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {maxAge: 300000000}
  }));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/users/:userId/cart', cartRouter);
app.use('/users/:userId/cart/checkout', checkoutRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`);
})