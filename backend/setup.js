#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
    console.log('🚀 WorkHub Pro Backend Setup');
    console.log('============================\n');

    // Check if .env already exists
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
        if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
            console.log('Setup cancelled.');
            rl.close();
            return;
        }
    }

    console.log('Please provide the following configuration details:\n');

    // Server Configuration
    const port = await question('Server Port (default: 5000): ') || '5000';
    const nodeEnv = await question('Node Environment (development/production) [development]: ') || 'development';

    // Database Configuration
    console.log('\n📊 Database Configuration:');
    const dbHost = await question('Database Host (default: localhost): ') || 'localhost';
    const dbUser = await question('Database User (default: root): ') || 'root';
    const dbPassword = await question('Database Password: ');
    const dbName = await question('Database Name (default: workhub_pro): ') || 'workhub_pro';
    const dbPort = await question('Database Port (default: 3306): ') || '3306';

    // Email Configuration
    console.log('\n📧 Email Configuration:');
    const emailHost = await question('Email Host (default: smtp.gmail.com): ') || 'smtp.gmail.com';
    const emailPort = await question('Email Port (default: 587): ') || '587';
    const emailUser = await question('Email Username: ');
    const emailPass = await question('Email Password/App Password: ');
    const emailFrom = await question('From Email (default: WorkHub Pro <noreply@workhubpro.com>): ') || 'WorkHub Pro <noreply@workhubpro.com>';

    // Admin Configuration
    console.log('\n👤 Admin Configuration:');
    const adminEmail = await question('Admin Email for notifications: ');

    // CORS Configuration
    console.log('\n🌐 CORS Configuration:');
    const corsOrigin = await question('CORS Origin (default: http://localhost:3000): ') || 'http://localhost:3000';

    // Generate JWT Secret
    const jwtSecret = require('crypto').randomBytes(64).toString('hex');

    // Create .env content
    const envContent = `# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}

# Database Configuration
DB_HOST=${dbHost}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}
DB_PORT=${dbPort}

# Email Configuration
EMAIL_HOST=${emailHost}
EMAIL_PORT=${emailPort}
EMAIL_USER=${emailUser}
EMAIL_PASS=${emailPass}
EMAIL_FROM=${emailFrom}

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=${corsOrigin}

# Admin Configuration
ADMIN_EMAIL=${adminEmail}
`;

    // Write .env file
    try {
        fs.writeFileSync(envPath, envContent);
        console.log('\n✅ .env file created successfully!');
    } catch (error) {
        console.error('❌ Error creating .env file:', error.message);
        rl.close();
        return;
    }

    // Create database setup SQL
    const sqlContent = `-- WorkHub Pro Database Setup
-- Run this SQL script in your MySQL database

CREATE DATABASE IF NOT EXISTS ${dbName};
USE ${dbName};

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create newsletter_subscribers table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create email_logs table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional)
INSERT IGNORE INTO contacts (name, email, subject, message) VALUES
('John Doe', 'john@example.com', 'Service Inquiry', 'I would like to know more about your web development services.'),
('Jane Smith', 'jane@example.com', 'Pricing Question', 'Could you please send me information about your pricing packages?');

INSERT IGNORE INTO newsletter_subscribers (email, source) VALUES
('subscriber1@example.com', 'website'),
('subscriber2@example.com', 'website');

SELECT 'Database setup completed successfully!' as message;
`;

    try {
        fs.writeFileSync(path.join(__dirname, 'database_setup.sql'), sqlContent);
        console.log('✅ Database setup SQL file created: database_setup.sql');
    } catch (error) {
        console.error('❌ Error creating SQL file:', error.message);
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the SQL script in your MySQL database:');
    console.log('   mysql -u root -p < database_setup.sql');
    console.log('2. Install dependencies:');
    console.log('   npm install');
    console.log('3. Start the server:');
    console.log('   npm run dev');
    console.log('\n📚 For more information, check the README.md file.');

    rl.close();
}

setup().catch(console.error);
