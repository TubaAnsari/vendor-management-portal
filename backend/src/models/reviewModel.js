const db = require('../config/database');

class Review {
    static async create(reviewData) {
        const { vendor_id, client_name, project_name, rating, comments } = reviewData;
        
        const query = `
            INSERT INTO reviews (vendor_id, client_name, project_name, rating, comments)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const values = [vendor_id, client_name, project_name, rating, comments];
        return db.query(query, values);
    }

    static async findByVendorId(vendorId) {
        const query = 'SELECT * FROM reviews WHERE vendor_id = $1 ORDER BY created_at DESC';
        const result = await db.query(query, [vendorId]);
        return result.rows;
    }

    static async getAverageRating(vendorId) {
        const query = 'SELECT AVG(rating)::DECIMAL(3,2) as average FROM reviews WHERE vendor_id = $1';
        const result = await db.query(query, [vendorId]);
        return result.rows[0];
    }
}

module.exports = Review;