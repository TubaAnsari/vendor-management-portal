const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protected routes (vendor only)
router.post('/', auth, upload.single('product_image'), productController.createProduct);
router.put('/:id', auth, upload.single('product_image'), productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;