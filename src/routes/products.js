const express = require('express');
const {
    createProduct,
    getProductById,
    getAllProducts,
    updateProduct,
    deleteProduct
} = require('../config/productConfig');

const { isAuthenticated } = require('../config/auth');

const router = express.Router();


router.get('/', getAllProducts);

router.get('/:productId', getProductById);

router.post('/', createProduct);

router.put('/:productId', updateProduct);

router.delete('/:productId', deleteProduct);


module.exports = router;


