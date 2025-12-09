const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    console.log('📁 Creating uploads directory...');
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
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all subdomains of Netlify
    if (origin.match(/\.netlify\.app$/)) {
      return callback(null, true);
    }
    
    // Allow all subdomains of onrender.com
    if (origin.match(/\.onrender\.com$/)) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked: Origin "${origin}" not in allowed list`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection test route
app.get('/api/db-test', async (req, res) => {
    try {
        const db = require('./src/config/database');
        const result = await db.query('SELECT NOW() as time, version() as version');
        res.json({ 
            success: true, 
            message: 'Database connected',
            data: result.rows[0],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Database connection failed',
            error: error.message,
            env: {
                db_host: process.env.DB_HOST,
                db_port: process.env.DB_PORT,
                db_name: process.env.DB_NAME,
                db_user: process.env.DB_USER,
                has_password: !!process.env.DB_PASSWORD
            }
        });
    }
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

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        cors_allowed_origins: allowedOrigins,
        database: 'check /api/db-test'
    });
});

// CORS Test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    origin: req.headers.origin,
    allowed_origins: allowedOrigins,
    timestamp: new Date().toISOString()
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
  console.error('❌ Error:', err.message);
  
  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS Error',
      message: `Origin "${req.headers.origin}" not allowed`,
      allowed_origins: allowedOrigins
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
    =====================================
    ✅ Server running on port ${PORT}
    📁 Environment: ${process.env.NODE_ENV || 'development'}
    🌐 CORS Allowed Origins:
        ${allowedOrigins.join('\n        ')}
    =====================================
    
    Test endpoints:
    🌐 Health check: http://localhost:${PORT}/health
    🔧 CORS test: http://localhost:${PORT}/api/cors-test
    🗄️  DB test: http://localhost:${PORT}/api/db-test
    =====================================
    `);
});