const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'vendor_portal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function checkDatabase() {
    try {
        console.log('🔍 Checking database...');
        
        // Check vendors
        const vendors = await pool.query('SELECT * FROM vendors');
        console.log(`✅ Found ${vendors.rowCount} vendors:`);
        console.log(vendors.rows);
        
        // Check tables
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log('\n📊 Tables in database:');
        tables.rows.forEach(table => console.log(`  - ${table.table_name}`));
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
        console.error('Error details:', error);
    } finally {
        await pool.end();
    }
}

checkDatabase();