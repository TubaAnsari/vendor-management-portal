const Vendor = require('../models/vendorModel');
const Product = require('../models/productModel');

const vendorController = {
    getAllVendors: async (req, res) => {
        try {
            console.log('📡 GET /api/vendors called');
            console.log('Query params:', req.query);
            
            const { category, search, sort } = req.query;
            const filters = { category, search, sort };
            
            console.log('Filters:', filters);
            
            const vendors = await Vendor.getAll(filters);
            
            console.log(`✅ Found ${vendors.length} vendors`);
            
            res.json(vendors);
        } catch (error) {
            console.error('❌ Get vendors error:', error);
            console.error('Error stack:', error.stack);
            res.status(500).json({ 
                error: 'Failed to fetch vendors',
                details: error.message 
            });
        }
    },

    getVendorById: async (req, res) => {
        try {
            const vendorId = req.params.id;
            const vendor = await Vendor.findById(vendorId);
            
            if (!vendor) {
                return res.status(404).json({ error: 'Vendor not found' });
            }

            // Get vendor's products
            const products = await Product.findByVendorId(vendorId);

            // Remove password from response
            delete vendor.password;

            res.json({
                ...vendor,
                products
            });

        } catch (error) {
            console.error('Get vendor error:', error);
            res.status(500).json({ error: 'Failed to fetch vendor' });
        }
    },

    getVendorProducts: async (req, res) => {
        try {
            const vendorId = req.params.id;
            const products = await Product.findByVendorId(vendorId);
            
            res.json(products);
        } catch (error) {
            console.error('Get products error:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    }
};

module.exports = vendorController;