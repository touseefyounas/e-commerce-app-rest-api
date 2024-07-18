const pool = require('./db');

const getCurrentTimeStamp = () => {
    return new Date().toISOString();
}

const cartExists = async (userId)=> {
    const cart = await pool.query('SELECT * FROM carts WHERE user_id=$1', [userId]);
    return cart.rows.length > 0;
}

const cartCreationByUserId = async (req, res, next) => {
    const userId = req.params.userId;
    const cartExist = await cartExists(userId);
    try {
    if (cartExist) {
        next();
    } else {
        const createdAt = getCurrentTimeStamp();
        const cart = await pool.query('INSERT INTO carts (user_id, created_at) VALUES ($1, $2)', 
            [userId, createdAt]);
        if (cart.rows.length > 0) {
            next()
        } else {
            res.status(500).json({ message: 'Failed to create cart' });
            }
        }
    } catch(err) {
        console.log(err.message);
        res.status(500).json({message: 'Server Error'});
    }
}

const getCart = async (req, res) => {
    const userId = req.params.userId;

    const cart = await pool.query('SELECT ci.*, p.name, p.price FROM cart_items ci INNER JOIN carts c ON ci.cart_id = c.id INNER JOIN products p ON ci.product_id = p.id WHERE c.user_id = $1', 
        [userId]);
    res.status(200).json(cart.rows);
}


const addItemToCart = async (req, res) => {
    const userId = req.params.userId;
    const { productId, quantity } = req.body;
    const createdAt = getCurrentTimeStamp();
    try {
    const cart = await pool.query('SELECT id FROM carts WHERE user_id=$1', [userId]);
    if (cart.rows.length > 0) {
        const cartId = cart.rows[0].id;
        const checkItem = await pool.query('SELECT * FROM cart_items WHERE product_id=$1', [productId]);
        if (checkItem.rows.length > 0) {
            res.status(400).json({message: 'Item already in the cart'});
        } else {
        const addItem = await pool.query('INSERT INTO cart_items (product_id, quantity, created_at, cart_id) VALUES ($1, $2, $3, $4) RETURNING *', 
            [productId, quantity, createdAt, cartId]);
        res.status(201).json(addItem.rows[0]);
        }
        } else {
            res.status(404).json({message: 'Cart not found for user'});
        }
    } catch(err) {
        console.log(err.message);
        res.status(500).json({message:'Server Error'});
    }
}
const updateCartItemById = async (req, res) => {

}

const deleteCartItemById = async (req, res) => {

}

module.exports = {
    cartCreationByUserId,
    getCart,
    addItemToCart,
    updateCartItemById,
    deleteCartItemById
};