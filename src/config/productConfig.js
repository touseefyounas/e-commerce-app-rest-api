const pool = require('./db');

const getCurrentTimeStamp = () => {
    return new Date().toISOString();
}
// Add product existance logic to getProductById, updateProduct, deleteProduct logic too

const productExists = async (sku) => {
    const productExist = await pool.query('SELECT * FROM product WHERE sku = $1', [sku]);
    return productExist ? productExist.rows[0] : false;
    }

const createProduct = async (req, res) => {
    const { name, description, sku, category_id, price, discount_id } = req.body;

    if (sku) {
    const product = await productExists(sku);
    if (!product){
        try {
            const createdAt = getCurrentTimeStamp();
            const newProduct = await pool.query('INSERT INTO product (name, description, sku, category_id, price, discount_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', 
                [name, description, sku, category_id, price, discount_id, createdAt]);
            res.status(201).json(newProduct.rows[0]);
        } catch (err){
            console.log(err.message);
            res.status(500).json({message: 'Server error'});
        }
    } else {
        res.status(400).json({message: 'SKU already exists, add a new SKU value'});
    }
} else {
    res.status(400).json({message: 'SKU is missing'});
}};


const getProductById = async (req, res) => {
    const id = req.params.productId;
    try{
    const product = await pool.query('SELECT * FROM product WHERE id = $1', [id]);
    res.status(200).json(product.rows[0])
    } catch(err) {
        console.log(err.message);
        res.status(500).json({message: 'Server error'});
    }
}

const getAllProducts = async (req, res) => {
    try {
        const products = await pool.query('SELECT * FROM product ORDER BY id ASC');
        res.status(200).json(products.rows);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message: 'Server error'});
    }
}

const updateProduct = async (req, res) => {
    const id = req.params.productId;
    const { name, description, sku, category_id, price, discount_id } = req.vody;
    const modifiedAt = getCurrentTimeStamp();
    try {
        const updatedProduct = await pool.query('UPDATE product SET name=$1, description=$2, sku=$3, category_id=$4, price=$5, discount_id=$6, modified_at=$7 WHERE id=$8 RETURNING *', 
        [name, description, sku, category_id, price, discount_id, modifiedAt, id]);
        res.status(201).json(updatedProduct.rows);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message:'Server error'});
    }
}

const deleteProduct = async (req, res) => {
    const id = req.params.productId;
    try {
        const deleteProduct = await pool.query('DELETE FROM product WHERE id=$1', [id]);
        res.status(200).send(`Product deleted with ID: ${id}`);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({message:'Server error'});
    }
}

module.exports = {
    createProduct,
    getProductById,
    getAllProducts,
    updateProduct,
    deleteProduct
}