const express = require('express');
const {
    cartCreationByUserId,
    getCart,
    addItemToCart,
    updateCartItemById,
    deleteCartItemById
} = require('../config/cartConfig');

const router = express.Router({ mergeParams: true });

router.use(cartCreationByUserId);

router.get('/', getCart);

router.post('/', addItemToCart);

router.put('/:cartItemId', updateCartItemById);

router.delete('/:cartItemId', deleteCartItemById);


module.exports = router;