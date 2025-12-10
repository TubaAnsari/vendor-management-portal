const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();

//  CONFIGURATION 
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
    'https://vendor-management-portal.onrender.com'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow all subdomains of Netlify and Render
        if (origin.match(/\.netlify\.app$/) || origin.match(/\.onrender\.com$/)) {
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            if (NODE_ENV === 'development') {
                console.log(`⚠️  CORS blocked origin: ${origin}`);
            }
            callback(null, false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

//  MIDDLEWARE 
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    }
    next();
});

//  IMPORT ROUTES 
try {
    const authRoutes = require('./src/routes/authRoutes');
    const vendorRoutes = require('./src/routes/vendorRoutes');
    const productRoutes = require('./src/routes/productRoutes');
    const reviewRoutes = require('./src/routes/reviewRoutes');
    const adminRoutes = require('./src/routes/adminRoutes');

    console.log('Routes loaded successfully');

    //  MOUNT ROUTES 
    app.use('/api/auth', authRoutes);
    app.use('/api/vendors', vendorRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/admin', adminRoutes);

} catch (error) {
    console.error('Failed to load routes:', error.message);
    process.exit(1);
}

//  TEST & HEALTH ENDPOINTS 
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'vendor-portal-api',
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/api/cors-test', (req, res) => {
    res.json({
        success: true,
        message: 'CORS is working!',
        origin: req.headers.origin,
        allowed_origins: allowedOrigins,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/db-test', async (req, res) => {
    try {
        const db = require('./src/config/database');
        const result = await db.query('SELECT NOW() as time, version() as version');
        res.json({
            success: true,
            message: 'Database connected',
            data: {
                time: result.rows[0].time,
                version: result.rows[0].version.split('\n')[0]
            },
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

//  ROOT ENDPOINT 
app.get('/', (req, res) => {
    res.json({
        message: 'Vendor Management Portal API',
        version: '1.0.0',
        environment: NODE_ENV,
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            vendors: '/api/vendors',
            products: '/api/products',
            reviews: '/api/reviews',
            admin: '/api/admin'
        },
        documentation: 'See README.md for API documentation',
        timestamp: new Date().toISOString()
    });
});

//  ERROR HANDLERS 
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    
    // Default to 500 if no status code
    const statusCode = err.status || 500;
    
    res.status(statusCode).json({
        success: false,
        error: 'Internal Server Error',
        message: NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

//  START SERVER 
const server = app.listen(PORT, () => {
    console.log(`

    Vendor Portal API Server Started
    Port: ${PORT}
    Environment: ${NODE_ENV}
    Uploads Directory: ${uploadsDir}
    CORS Allowed Origins: ${allowedOrigins.join(', ')}
    Health Check: http://localhost:${PORT}/health
    API Root: http://localhost:${PORT}/
    Database Test: http://localhost:${PORT}/api/db-test
    `);
});

// Graceful shutdown
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

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;