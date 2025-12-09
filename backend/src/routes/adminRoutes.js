const express = require('express');
const router = express.Router();
const db = require('../config/database'); // Add this line

// Get all vendors with stats (no auth for this task)
router.get('/vendors', async (req, res) => {
    try {
        const query = `
            SELECT 
                v.id,
                v.vendor_name,
                v.business_category,
                v.email,
                v.contact_number,
                v.city,
                v.average_rating,
                v.review_count,
                v.created_at,
                COUNT(p.id) as product_count
            FROM vendors v
            LEFT JOIN products p ON v.id = p.vendor_id
            GROUP BY v.id
            ORDER BY v.created_at DESC
        `;
        
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Admin get vendors error:', error);
        res.status(500).json({ error: 'Failed to fetch vendors' });
    }
});

// Get vendor details with all info
router.get('/vendors/:id', async (req, res) => {
    try {
        const vendorId = req.params.id;
        
        // Get vendor
        const vendorQuery = 'SELECT * FROM vendors WHERE id = $1';
        const vendorResult = await db.query(vendorQuery, [vendorId]);
        
        if (vendorResult.rows.length === 0) {
            return res.status(404).json({ error: 'Vendor not found' });
        }
        
        const vendor = vendorResult.rows[0];
        
        // Get products
        const productsQuery = 'SELECT * FROM products WHERE vendor_id = $1';
        const productsResult = await db.query(productsQuery, [vendorId]);
        
        // Get reviews
        const reviewsQuery = 'SELECT * FROM reviews WHERE vendor_id = $1 ORDER BY created_at DESC';
        const reviewsResult = await db.query(reviewsQuery, [vendorId]);
        
        // Remove password from response
        delete vendor.password;
        
        res.json({
            vendor,
            products: productsResult.rows,
            reviews: reviewsResult.rows
        });
        
    } catch (error) {
        console.error('Admin get vendor error:', error);
        res.status(500).json({ error: 'Failed to fetch vendor details' });
    }
});

module.exports = router;