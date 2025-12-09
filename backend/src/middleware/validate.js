const Joi = require('joi');

const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        try {
            const { error, value } = schema.validate(req[property], {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }));

                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors
                });
            }

            // Replace request data with validated data
            req[property] = value;
            next();
        } catch (err) {
            console.error('Validation middleware error:', err);
            res.status(500).json({
                success: false,
                error: 'Internal validation error'
            });
        }
    };
};

// Common validation schemas
const schemas = {
    // Vendor registration
    registerVendor: Joi.object({
        vendor_name: Joi.string().min(2).max(255).required()
            .messages({
                'string.empty': 'Vendor name is required',
                'string.min': 'Vendor name must be at least 2 characters',
                'string.max': 'Vendor name cannot exceed 255 characters'
            }),
        owner_name: Joi.string().min(2).max(255).required(),
        contact_number: Joi.string().pattern(/^[0-9]{10}$/).required()
            .messages({
                'string.pattern.base': 'Contact number must be 10 digits'
            }),
        email: Joi.string().email().required(),
        business_category: Joi.string().required(),
        city: Joi.string().required(),
        description: Joi.string().min(10).max(1000).required(),
        password: Joi.string().min(6).required()
            .messages({
                'string.min': 'Password must be at least 6 characters'
            })
    }),

    // Login
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    // Update profile
    updateProfile: Joi.object({
        vendor_name: Joi.string().min(2).max(255),
        owner_name: Joi.string().min(2).max(255),
        contact_number: Joi.string().pattern(/^[0-9]{10}$/),
        business_category: Joi.string(),
        city: Joi.string(),
        description: Joi.string().min(10).max(1000)
    }).min(1), // At least one field should be provided

    // Create product
    createProduct: Joi.object({
        product_name: Joi.string().min(2).max(255).required(),
        short_description: Joi.string().min(10).max(500).required(),
        price_range: Joi.string().max(100)
    }),

    // Create review
    createReview: Joi.object({
        client_name: Joi.string().min(2).max(255).required(),
        project_name: Joi.string().max(255),
        rating: Joi.number().integer().min(1).max(5).required(),
        comments: Joi.string().min(10).max(1000).required()
    }),

    // Delete profile
    deleteProfile: Joi.object({
        reason: Joi.string().max(500)
    }),

    // Vendor filters
    vendorFilters: Joi.object({
        category: Joi.string().max(100),
        search: Joi.string().max(255),
        sort: Joi.string().valid('rating', 'newest', 'name'),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    })
};

module.exports = {
    validate,
    schemas
};