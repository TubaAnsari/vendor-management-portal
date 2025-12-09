const { Pool } = require('pg');
require('dotenv').config();

console.log('Testing PostgreSQL connection...');
console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '*** (set)' : 'NOT SET!');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('\n✅ Database connected successfully!');
        
        // Test if tables exist
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        console.log('\n📊 Existing tables:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });
        
        // Test vendors table
        const vendorsCount = await client.query('SELECT COUNT(*) FROM vendors');
        console.log(`\n👥 Vendors count: ${vendorsCount.rows[0].count}`);
        
        client.release();
        await pool.end();
        
    } catch (error) {
        console.error('\n❌ Database connection failed:', error.message);
        console.error('\nTroubleshooting steps:');
        console.error('1. Check if PostgreSQL is running');
        console.error('2. Verify database exists: psql -U postgres -c "\\l"');
        console.error('3. Check .env file has correct credentials');
        console.error('4. Run database schema: psql -U postgres -d vendor_portal -f database.sql');
    }
}

testConnection();