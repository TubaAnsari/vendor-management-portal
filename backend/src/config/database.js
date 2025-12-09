const { Pool } = require('pg');
require('dotenv').config();

console.log('📊 PostgreSQL Connection Details:');
console.log('  Host:', process.env.DB_HOST || 'Not set');
console.log('  Port:', process.env.DB_PORT || 'Not set');
console.log('  Database:', process.env.DB_NAME || 'Not set');
console.log('  User:', process.env.DB_USER || 'Not set');
console.log('  Password:', process.env.DB_PASSWORD ? '*** (set)' : 'NOT SET!');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'vendor_portal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection immediately
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('Error details:', err);
    } else {
        console.log('✅ Database connected successfully at:', res.rows[0].now);
    }
});

pool.on('connect', () => {
    console.log('🟢 New client connected to PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle PostgreSQL client', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool  // Make sure pool is exported
};