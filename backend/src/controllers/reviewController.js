const Review = require('../models/reviewModel');
const Vendor = require('../models/vendorModel');

const reviewController = {
    createReview: async (req, res) => {
        try {
            const vendorId = req.params.id;
            const { client_name, project_name, rating, comments } = req.body;

            // Check if vendor exists
            const vendor = await Vendor.findById(vendorId);
            if (!vendor) {
                return res.status(404).json({ error: 'Vendor not found' });
            }

            const reviewData = {
                vendor_id: vendorId,
                client_name,
                project_name,
                rating: parseInt(rating),
                comments
            };

            const result = await Review.create(reviewData);
            const review = result.rows[0];

            // Update vendor's average rating
            await Vendor.updateRating(vendorId);

            res.status(201).json({
                message: 'Review submitted successfully',
                review
            });

        } catch (error) {
            console.error('Create review error:', error);
            res.status(500).json({ error: 'Failed to submit review' });
        }
    },

    getVendorReviews: async (req, res) => {
        try {
            const vendorId = req.params.id;
            const reviews = await Review.findByVendorId(vendorId);
            
            res.json(reviews);
        } catch (error) {
            console.error('Get reviews error:', error);
            res.status(500).json({ error: 'Failed to fetch reviews' });
        }
    }
};

module.exports = reviewController;