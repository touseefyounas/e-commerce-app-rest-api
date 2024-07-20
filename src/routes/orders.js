const express = require('express');

const { isAuthenticated } = require('../config/auth');
const { getAllOrders } = require('../config/ordersConfig');


const router = express.Router({ mergeParams: true });

// ADD isAuthenticated function before deployment to enable user verification
router.get('/', getAllOrders);

module.exports = router;