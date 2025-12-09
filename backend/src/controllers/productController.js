const Product = require('../models/productModel');

const productController = {
    createProduct: async (req, res) => {
        try {
            const { product_name, short_description, price_range } = req.body;
            const vendor_id = req.vendor.id;
            
            const product_image = req.file ? `/uploads/${req.file.filename}` : null;

            const productData = {
                vendor_id,
                product_name,
                product_image,
                short_description,
                price_range
            };

            const result = await Product.create(productData);
            const product = result.rows[0];

            res.status(201).json({
                message: 'Product created successfully',
                product
            });

        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({ error: 'Failed to create product' });
        }
    },

    updateProduct: async (req, res) => {
        try {
            const productId = req.params.id;
            const vendorId = req.vendor.id;
            const { product_name, short_description, price_range } = req.body;

            const updateData = {};
            if (product_name) updateData.product_name = product_name;
            if (short_description) updateData.short_description = short_description;
            if (price_range) updateData.price_range = price_range;
            
            if (req.file) {
                updateData.product_image = `/uploads/${req.file.filename}`;
            }

            const result = await Product.update(productId, vendorId, updateData);
            
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Product not found or unauthorized' });
            }

            const updatedProduct = result.rows[0];

            res.json({
                message: 'Product updated successfully',
                product: updatedProduct
            });

        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({ error: 'Failed to update product' });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const productId = req.params.id;
            const vendorId = req.vendor.id;

            const result = await Product.delete(productId, vendorId);
            
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Product not found or unauthorized' });
            }

            res.json({
                message: 'Product deleted successfully'
            });

        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({ error: 'Failed to delete product' });
        }
    }
};

module.exports = productController;