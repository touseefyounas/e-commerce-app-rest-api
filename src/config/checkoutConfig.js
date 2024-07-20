const pool = require('./db');
const { cartExists } = require('./cartConfig');

const getCurrentTimeStamp = () => {
    return new Date().toISOString();
}

const checkout = async (req, res) => {
    
    const userId = req.params.userId;

    const cartExist = await cartExists(userId);
    const paymentApproved = true;
    
    if (paymentApproved && cartExist) {
    const createdAt = getCurrentTimeStamp();
    
    try {
        const cart = await pool.query('SELECT * FROM carts WHERE user_id =$1', 
            [userId])
        const cartId = cart.rows[0].id;
        if (cartId) {
            const order = await pool.query('INSERT INTO orders (user_id, created_at) VALUES ($1, $2) RETURNING *',
                [userId, createdAt]);
            if (order.rows.length === 0) {
                return res.status(500).json({message: 'Order insertion failed'});
                }
            const orderId = order.rows[0].id;
            const orderItems = await pool.query('INSERT INTO order_items (order_id, product_id, quantity, created_at) SELECT $1, product_id, quantity, $2 FROM cart_items WHERE cart_id=$3 RETURNING *',
                                [orderId, createdAt, cartId]);
            if (!orderItems.rows){
                throw new Error('Order Items Creation Failed');
            }
            res.status(201).json(orderItems.rows);
        } else {
            res.status(404).json({message: 'Cart not found for user'});
        }
    } catch(err) {
        console.log(err.message);
        res.status(500).json({message: 'Server Error'});
        }
    } else {
        res.status(500).json({message: 'Payment Error'});
    }
}

module.exports = { checkout };