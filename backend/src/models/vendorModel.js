const db = require('../config/database');

class Vendor {
    static async create(vendorData) {
        const { vendor_name, owner_name, contact_number, email, business_category, city, description, logo_url, password } = vendorData;
        
        const query = `
            INSERT INTO vendors (vendor_name, owner_name, contact_number, email, business_category, city, description, logo_url, password)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, vendor_name, email, created_at
        `;
        
        const values = [vendor_name, owner_name, contact_number, email, business_category, city, description, logo_url, password];
        
        return db.query(query, values);
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM vendors WHERE email = $1';
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM vendors WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async getAll(filters = {}) {
    let query = 'SELECT * FROM vendors WHERE 1=1';
    const values = [];
    let paramCount = 1;

    // Always exclude soft-deleted vendors
    // query += ' AND is_deleted = FALSE';

    if (filters.category && filters.category !== '') {
        query += ` AND business_category = $${paramCount}`;
        values.push(filters.category);
        paramCount++;
    }

    if (filters.search && filters.search.trim() !== '') {
        query += ` AND (vendor_name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
        values.push(`%${filters.search.trim()}%`);
        paramCount++;
    }

    if (filters.sort === 'rating') {
        query += ' ORDER BY average_rating DESC NULLS LAST';
    } else if (filters.sort === 'newest') {
        query += ' ORDER BY created_at DESC';
    } else if (filters.sort === 'name') {
        query += ' ORDER BY vendor_name ASC';
    } else {
        query += ' ORDER BY created_at DESC'; // Default to newest
    }

    console.log('Vendor query:', query, values); // Add this for debugging
    const result = await db.query(query, values);
    return result.rows;
}
    static async update(id, updateData) {
        const fields = Object.keys(updateData);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        
        const query = `
            UPDATE vendors 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1 
            RETURNING *
        `;
        
        const values = [id, ...Object.values(updateData)];
        return db.query(query, values);
    }

    static async updateRating(vendorId) {
        const query = `
            UPDATE vendors 
            SET average_rating = (
                SELECT AVG(rating)::DECIMAL(3,2) 
                FROM reviews 
                WHERE vendor_id = $1
            ),
            review_count = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE vendor_id = $1
            )
            WHERE id = $1
            RETURNING average_rating, review_count
        `;
        
        return db.query(query, [vendorId]);
    }
}

module.exports = Vendor;