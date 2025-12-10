const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
// Database initialization
const { initializeDatabase } = require('./db-init');

// Initialize database on startup
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
});

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
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Allow all subdomains of Netlify and Render
    if (origin.match(/\.netlify\.app$/) || origin.match(/\.onrender\.com$/)) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      if (NODE_ENV === 'development') {
        console.log(`CORS blocked origin: ${origin}`);
      }
      callback(null, true); // Allow for testing
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
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
  console.log('Debug endpoint called');
  console.log('Headers:', req.headers);
  console.log('Origin:', req.headers.origin);
  
  res.json({
    success: true,
    message: 'Debug endpoint',
    headers: req.headers,
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
    cors_allowed: allowedOrigins,
    database_url: process.env.DATABASE_URL ? 'Set' : 'Not set'
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
  console.error('Stack:', err.stack);
  
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
    Server running on port ${PORT}
    Environment: ${NODE_ENV}
    CORS Origins: ${allowedOrigins.join(', ')}
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