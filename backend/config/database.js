const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root12',
    database: process.env.DB_NAME || 'workhub_pro',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Database configuration without database name (for creating database)
const dbConfigWithoutDB = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root12',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Create database if it doesn't exist
const createDatabase = async () => {
    try {
        const tempPool = mysql.createPool(dbConfigWithoutDB);
        const connection = await tempPool.getConnection();
        
        const dbName = process.env.DB_NAME || 'workhub_pro';
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✅ Database '${dbName}' created/verified successfully`);
        
        connection.release();
        await tempPool.end();
        return true;
    } catch (error) {
        console.error('❌ Database creation failed:', error.message);
        return false;
    }
};

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Initialize database tables
const initializeDatabase = async () => {
    try {
        const connection = await pool.getConnection();
        
        // Create contacts table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(500) NOT NULL,
                message TEXT NOT NULL,
                status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Create newsletter_subscribers table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                status ENUM('active', 'unsubscribed', 'bounced') DEFAULT 'active',
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                unsubscribed_at TIMESTAMP NULL,
                source VARCHAR(100) DEFAULT 'website',
                ip_address VARCHAR(45),
                user_agent TEXT,
                INDEX idx_email (email),
                INDEX idx_status (status),
                INDEX idx_subscribed_at (subscribed_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Create email_logs table for tracking sent emails
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS email_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type ENUM('contact', 'newsletter', 'notification') NOT NULL,
                recipient_email VARCHAR(255) NOT NULL,
                subject VARCHAR(500) NOT NULL,
                status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
                error_message TEXT NULL,
                sent_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_type (type),
                INDEX idx_recipient (recipient_email),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✅ Database tables initialized successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        return false;
    }
};

module.exports = {
    pool,
    createDatabase,
    testConnection,
    initializeDatabase
};
