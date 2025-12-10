const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://vendor-management-portal.netlify.app',
    'https://vendor-management-portal.onrender.com',
    'https://vendor-management-portal-frontend.netlify.app',
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.match(/\.netlify\.app$/) || origin.match(/\.onrender\.com$/)) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            if (NODE_ENV === 'development') {
                console.log('CORS blocked origin:', origin);
            }
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Apply CORS first
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    console.log('Origin:', req.headers.origin);
    next();
});

// Database connection
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Check and create tables if they don't exist
async function checkAndCreateTables() {
    try {
        console.log('Checking database tables...');
        const client = await pool.connect();
        
        // Check if vendors table exists
        const result = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'vendors'
            );
        `);
        
        if (!result.rows[0].exists) {
            console.log('Vendors table not found, creating tables...');
            
            // Create vendors table
            await client.query(`
                CREATE TABLE vendors (
                    id SERIAL PRIMARY KEY,
                    vendor_name VARCHAR(255) NOT NULL,
                    owner_name VARCHAR(255) NOT NULL,
                    contact_number VARCHAR(20) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    business_category VARCHAR(100) NOT NULL,
                    city VARCHAR(100) NOT NULL,
                    description TEXT,
                    logo_url VARCHAR(500),
                    password VARCHAR(255) NOT NULL,
                    average_rating DECIMAL(3,2) DEFAULT 0.00,
                    review_count INTEGER DEFAULT 0,
                    is_deleted BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Create products table
            await client.query(`
                CREATE TABLE products (
                    id SERIAL PRIMARY KEY,
                    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
                    product_name VARCHAR(255) NOT NULL,
                    product_image VARCHAR(500),
                    short_description TEXT,
                    price_range VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Create reviews table
            await client.query(`
                CREATE TABLE reviews (
                    id SERIAL PRIMARY KEY,
                    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
                    client_name VARCHAR(255) NOT NULL,
                    project_name VARCHAR(255),
                    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
                    comments TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            console.log('Database tables created successfully!');
        } else {
            console.log('Database tables already exist');
        }
        
        client.release();
    } catch (error) {
        console.error('Error checking/creating tables:', error.message);
    }
}

// Run table check on startup
checkAndCreateTables();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const vendorRoutes = require('./src/routes/vendorRoutes');
const productRoutes = require('./src/routes/productRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Debug endpoint
app.get('/api/debug', (req, res) => {
    res.json({
        success: true,
        message: 'Debug endpoint',
        origin: req.headers.origin,
        timestamp: new Date().toISOString(),
        env: NODE_ENV,
        cors_allowed: allowedOrigins,
    });
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'vendor-portal-api',
        environment: NODE_ENV
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'vendor-portal-api',
        environment: NODE_ENV,
        endpoints: {
            auth: '/api/auth',
            vendors: '/api/vendors',
            products: '/api/products',
            reviews: '/api/reviews',
            admin: '/api/admin'
        }
    });
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as time');
        res.json({
            success: true,
            message: 'Database connected',
            time: result.rows[0].time,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Vendor Management Portal API',
        version: '1.0.0',
        documentation: '/api/health for endpoint info',
        status: 'running'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    
    res.status(err.status || 500).json({
        success: false,
        error: 'Internal Server Error',
        message: NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    Vendor Portal API Server Started
    Port: ${PORT}
    Environment: ${NODE_ENV}
    CORS Allowed Origins: ${allowedOrigins.join(', ')}
    Health Check: http://localhost:${PORT}/health
    `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app;