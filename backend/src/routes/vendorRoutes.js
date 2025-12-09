const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

// Public routes
router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorById);
router.get('/:id/products', vendorController.getVendorProducts);

module.exports = router;