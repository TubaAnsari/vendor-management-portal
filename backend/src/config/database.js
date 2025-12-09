const { Pool } = require('pg');
require('dotenv').config();

// Render provides DATABASE_URL in production
const isProduction = process.env.NODE_ENV === 'production';

// Log connection details
console.log('📊 PostgreSQL Connection Details:');
console.log('  Environment:', process.env.NODE_ENV || 'development');
console.log('  Using DATABASE_URL:', !!process.env.DATABASE_URL);

let poolConfig;

if (isProduction && process.env.DATABASE_URL) {
    // Use Render's PostgreSQL connection string
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    };
} else {
    // Local development
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'vendor_portal',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    };
}

const pool = new Pool(poolConfig);

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