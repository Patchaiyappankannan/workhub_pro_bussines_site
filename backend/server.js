const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Import database and email configuration
const { createDatabase, testConnection, initializeDatabase } = require('./config/database');
const { verifyEmailConfig } = require('./config/email');

// Import routes
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');

// Import middleware
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:5000", "http://127.0.0.1:5000"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: [
        process.env.CORS_ORIGIN || 'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'http://localhost:5500',
        'http://127.0.0.1:5500'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'WorkHub Pro API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
    const { pool } = require('./config/database');
    const connection = await pool.getConnection();
    
    try {
        // Test basic connection
        const [result] = await connection.execute('SELECT 1 as test');
        
        // Check if tables exist
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('contacts', 'newsletter_subscribers', 'email_logs')
        `, [process.env.DB_NAME || 'workhub_pro']);
        
        res.json({
            success: true,
            message: 'Database connection successful',
            tables: tables.map(t => t.TABLE_NAME),
            testResult: result[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database test failed',
            error: error.message
        });
    } finally {
        connection.release();
    }
});

// API routes
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Serve static files from the frontend (if needed)
app.use(express.static(path.join(__dirname, '../')));

// Catch-all handler for frontend routes (SPA)
app.get('*', (req, res) => {
    // Only serve the frontend for non-API routes
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, '../index.html'));
    } else {
        res.status(404).json({
            success: false,
            message: 'API endpoint not found'
        });
    }
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(isDevelopment && { stack: error.stack })
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start server
const startServer = async () => {
    try {
        // Create database if it doesn't exist
        const dbCreated = await createDatabase();
        if (!dbCreated) {
            console.error('❌ Failed to create database. Server will not start.');
            process.exit(1);
        }

        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Server will not start.');
            process.exit(1);
        }

        // Initialize database tables
        const dbInitialized = await initializeDatabase();
        if (!dbInitialized) {
            console.error('❌ Failed to initialize database. Server will not start.');
            process.exit(1);
        }

        // Test email configuration
        const emailConfigured = await verifyEmailConfig();
        if (!emailConfigured) {
            console.warn('⚠️  Email configuration failed. Email features may not work properly.');
        }

        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 WorkHub Pro API server is running on port ${PORT}`);
            console.log(`📧 Email service: ${emailConfigured ? 'Ready' : 'Not configured'}`);
            console.log(`🗄️  Database: Connected`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

module.exports = app;
