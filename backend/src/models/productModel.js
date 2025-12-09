const db = require('../config/database');

class Product {
    static async create(productData) {
        const { vendor_id, product_name, product_image, short_description, price_range } = productData;
        
        const query = `
            INSERT INTO products (vendor_id, product_name, product_image, short_description, price_range)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const values = [vendor_id, product_name, product_image, short_description, price_range];
        return db.query(query, values);
    }

    static async findByVendorId(vendorId) {
        const query = 'SELECT * FROM products WHERE vendor_id = $1 ORDER BY created_at DESC';
        const result = await db.query(query, [vendorId]);
        return result.rows;
    }

    static async findById(id) {
        const query = 'SELECT * FROM products WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async update(id, vendorId, updateData) {
        const fields = Object.keys(updateData);
        const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
        
        const query = `
            UPDATE products 
            SET ${setClause}
            WHERE id = $1 AND vendor_id = $2
            RETURNING *
        `;
        
        const values = [id, vendorId, ...Object.values(updateData)];
        return db.query(query, values);
    }

    static async delete(id, vendorId) {
        const query = 'DELETE FROM products WHERE id = $1 AND vendor_id = $2 RETURNING id';
        return db.query(query, [id, vendorId]);
    }
}

module.exports = Product;