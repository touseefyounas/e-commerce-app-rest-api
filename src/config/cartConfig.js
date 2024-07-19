const pool = require('./db');

const getCurrentTimeStamp = () => {
    return new Date().toISOString();
}

const cartExists = async (userId)=> {
    const cart = await pool.query('SELECT * FROM carts WHERE user_id=$1', [userId]);
    return cart.rows[0]? true : false;
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

        if (cart.rows[0]) {
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

    const cart = await pool.query('SELECT ci.*, p.name, p.price FROM cart_items ci INNER JOIN carts c ON ci.cart_id = c.id INNER JOIN product p ON ci.product_id = p.id WHERE c.user_id = $1', 
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
            const checkItem = await pool.query('SELECT * FROM cart_items WHERE product_id=$1 AND cart_id=$2', [productId, cartId]);
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
    const userId = req.params.userId;
    const { productId, quantity } = req.body;
    const modifiedAt = getCurrentTimeStamp();
    try {
        const cart = await pool.query('SELECT id FROM carts WHERE user_id=$1', [userId]);
        
        if (cart.rows.length > 0) {
            const cartId = cart.rows[0].id;
            const updatedItem = await pool.query('UPDATE cart_items SET quantity =$1, modified_at=$2 WHERE cart_id=$3 AND product_id=$4 RETURNING *',
                                [quantity, modifiedAt, cartId, productId]);
            res.status(201).json(updatedItem.rows);
        } else {
            res.status(404).json({message: 'Cart not found for user'});
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message:'Server Error'});
    }
}

const deleteCartItemById = async (req, res) => {
    const userId = req.params.userId;
    const { productId } = req.body;
    try {
        const cart = await pool.query('SELECT id FROM carts WHERE user_id=$1', [userId]);
        if (cart.rows.length > 0) {
            const cartId = cart.rows[0].id;
            const deletedItem = await pool.query('DELETE FROM cart_items WHERE cart_id=$1 AND product_id=$2 RETURNING *',
                                [cartId, productId]);
            res.status(201).json(deletedItem.rows);
        } else {
            res.status(404).json({message: 'Cart not found for user'});
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message:'Server Error'});
    }
}

module.exports = {
    cartCreationByUserId,
    getCart,
    addItemToCart,
    updateCartItemById,
    deleteCartItemById
};