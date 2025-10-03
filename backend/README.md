# WorkHub Pro Backend API

A Node.js backend API for the WorkHub Pro business website, built with Express.js and MySQL.

## Features

- **Contact Form API**: Handle contact form submissions with email notifications
- **Newsletter API**: Manage newsletter subscriptions and unsubscriptions
- **Email Service**: Automated email sending with beautiful HTML templates
- **Database Integration**: MySQL database with proper indexing and relationships
- **Rate Limiting**: Protect against spam and abuse
- **Input Validation**: Comprehensive validation and sanitization
- **Error Handling**: Robust error handling and logging
- **Security**: Helmet.js for security headers and CORS protection

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory with the following variables:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=workhub_pro
   DB_PORT=3306

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=WorkHub Pro <noreply@workhubpro.com>

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000

   # Admin Configuration
   ADMIN_EMAIL=admin@workhubpro.com
   ```

4. **Set up MySQL database:**
   ```sql
   CREATE DATABASE workhub_pro;
   ```

5. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Contact Form

- **POST** `/api/contact/submit` - Submit contact form
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Inquiry about services",
    "message": "I would like to know more about your services."
  }
  ```

### Newsletter

- **POST** `/api/newsletter/subscribe` - Subscribe to newsletter
  ```json
  {
    "email": "john@example.com",
    "source": "website"
  }
  ```

- **POST** `/api/newsletter/unsubscribe` - Unsubscribe from newsletter
  ```json
  {
    "email": "john@example.com"
  }
  ```

### Admin Endpoints

- **GET** `/api/contact/admin/contacts` - Get all contacts (with pagination)
- **GET** `/api/contact/admin/contacts/:id` - Get contact by ID
- **PATCH** `/api/contact/admin/contacts/:id/status` - Update contact status
- **DELETE** `/api/contact/admin/contacts/:id` - Delete contact
- **GET** `/api/newsletter/admin/subscribers` - Get all subscribers
- **GET** `/api/newsletter/admin/subscribers/:email` - Get subscriber by email
- **GET** `/api/newsletter/admin/stats` - Get newsletter statistics

### Health Check

- **GET** `/health` - Server health check

## Database Schema

### Contacts Table
```sql
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Newsletter Subscribers Table
```sql
CREATE TABLE newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    status ENUM('active', 'unsubscribed', 'bounced') DEFAULT 'active',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    source VARCHAR(100) DEFAULT 'website',
    ip_address VARCHAR(45),
    user_agent TEXT
);
```

### Email Logs Table
```sql
CREATE TABLE email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('contact', 'newsletter', 'notification') NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
    error_message TEXT NULL,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Email Configuration

The API uses Nodemailer for sending emails. For Gmail, you'll need to:

1. Enable 2-factor authentication on your Google account
2. Generate an App Password
3. Use the App Password in the `EMAIL_PASS` environment variable

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Contact Form**: 5 submissions per 15 minutes per IP
- **Newsletter**: 3 subscriptions per hour per IP

## Security Features

- Helmet.js for security headers
- CORS protection
- Input validation and sanitization
- Rate limiting
- SQL injection prevention
- XSS protection

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // For validation errors
}
```

## Development

### Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-restart
- `npm test` - Run tests (not implemented yet)

### Logging

The API logs all requests and errors to the console. In production, consider using a proper logging service.

## Deployment

1. Set `NODE_ENV=production`
2. Update CORS_ORIGIN to your production domain
3. Use a production MySQL database
4. Configure proper email settings
5. Set up SSL/TLS certificates
6. Use a process manager like PM2

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Proprietary - WorkHub Pro
