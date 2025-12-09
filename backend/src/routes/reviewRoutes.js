const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Public routes
router.post('/:id', reviewController.createReview);
router.get('/:id', reviewController.getVendorReviews);

module.exports = router;