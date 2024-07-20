const express = require('express');

const { checkout } = require('../config/checkoutConfig');

const { isAuthenticated } = require('../config/auth');

const router = express.Router({ mergeParams: true });

router.post('/', checkout);



module.exports = router;