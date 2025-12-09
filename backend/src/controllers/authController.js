const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Vendor = require('../models/vendorModel');
const db = require('../config/database');

const authController = {
    register: async (req, res) => {
        try {
            const { vendor_name, owner_name, contact_number, email, business_category, city, description, password } = req.body;
            
            const existingVendor = await Vendor.findByEmail(email);
            if (existingVendor) {
                return res.status(400).json({ error: 'Vendor already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const logo_url = req.file ? `/uploads/${req.file.filename}` : null;

            const vendorData = {
                vendor_name,
                owner_name,
                contact_number,
                email,
                business_category,
                city,
                description,
                logo_url,
                password: hashedPassword
            };

            const result = await Vendor.create(vendorData);
            const vendor = result.rows[0];

            const token = jwt.sign(
                { id: vendor.id, email: vendor.email },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                message: 'Vendor registered successfully',
                vendor: {
                    id: vendor.id,
                    vendor_name: vendor.vendor_name,
                    email: vendor.email
                },
                token
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const vendor = await Vendor.findByEmail(email);
            if (!vendor) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isPasswordValid = await bcrypt.compare(password, vendor.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: vendor.id, email: vendor.email },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: 'Login successful',
                vendor: {
                    id: vendor.id,
                    vendor_name: vendor.vendor_name,
                    email: vendor.email,
                    logo_url: vendor.logo_url
                },
                token
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    },

    getProfile: async (req, res) => {
        try {
            const vendor = await Vendor.findById(req.vendor.id);
            if (!vendor) {
                return res.status(404).json({ error: 'Vendor not found' });
            }

            delete vendor.password;
            res.json(vendor);
        } catch (error) {
            console.error('Profile error:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { vendor_name, owner_name, contact_number, business_category, city, description } = req.body;
            
            const updateData = {};
            if (vendor_name) updateData.vendor_name = vendor_name;
            if (owner_name) updateData.owner_name = owner_name;
            if (contact_number) updateData.contact_number = contact_number;
            if (business_category) updateData.business_category = business_category;
            if (city) updateData.city = city;
            if (description) updateData.description = description;
            
            if (req.file) {
                updateData.logo_url = `/uploads/${req.file.filename}`;
            }

            const result = await Vendor.update(req.vendor.id, updateData);
            const updatedVendor = result.rows[0];

            delete updatedVendor.password;

            res.json({
                message: 'Profile updated successfully',
                vendor: updatedVendor
            });

        } catch (error) {
            console.error('Update error:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    },

    deleteProfile: async (req, res) => {
        try {
            const vendorId = req.vendor.id;
            const { reason } = req.body;

            console.log(`Deleting vendor ${vendorId}, Reason: ${reason || 'No reason provided'}`);

            const query = 'DELETE FROM vendors WHERE id = $1 RETURNING id, vendor_name, email';
            const result = await db.query(query, [vendorId]);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Vendor not found' });
            }

            res.json({
                message: 'Profile deleted successfully',
                deleted_vendor: result.rows[0],
                reason: reason || 'No reason provided'
            });

        } catch (error) {
            console.error('Delete profile error:', error);
            res.status(500).json({ error: 'Failed to delete profile' });
        }
    }
};

module.exports = authController;