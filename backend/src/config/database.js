const { Pool } = require('pg');
require('dotenv').config();

// Log connection details (except password)
console.log('📊 PostgreSQL Connection Details:');
console.log('  Host:', process.env.DB_HOST || 'Not set');
console.log('  Port:', process.env.DB_PORT || 'Not set');
console.log('  Database:', process.env.DB_NAME || 'Not set');
console.log('  User:', process.env.DB_USER || 'Not set');
console.log('  Environment:', process.env.NODE_ENV || 'development');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connected successfully');
    }
});

pool.on('connect', () => {
    console.log('🟢 New PostgreSQL connection established');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle PostgreSQL client', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};