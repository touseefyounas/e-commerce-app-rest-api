const pool = require('./db');

const { userExists } = require('./auth');


const getCurrentTimeStamp = () => {
    return new Date().toISOString();
}


const getAllOrders = async (req, res) => {
    userId = req.params.userId;
    try{
    const userExist = userExists(userId);

    if (userExist){
        const order = await pool.query('SELECT * FROM orders WHERE user_id=$1', [userId]);
        const orders = order.rows;
        if (orders) {
            res.status(200).json(orders);
        } else {
            res.status(404).json({message: 'No orders found'});
        }        
    } else {
        res.status(404).json({message: 'User does not exist'});
    }
    } catch(err){
        console.log(err.message);
        res.status(500).json({message: 'Server Error'});
    }
}


module.exports = {getAllOrders};