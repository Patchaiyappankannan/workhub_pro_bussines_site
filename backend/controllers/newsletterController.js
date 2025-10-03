const { pool } = require('../config/database');
const { sendEmail, emailTemplates } = require('../config/email');

// Subscribe to newsletter
const subscribeNewsletter = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { email, source = 'website' } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        // Check if email already exists
        const [existingSubscribers] = await connection.execute(
            `SELECT id, status FROM newsletter_subscribers WHERE email = ?`,
            [email]
        );

        if (existingSubscribers.length > 0) {
            const subscriber = existingSubscribers[0];
            
            if (subscriber.status === 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already subscribed to our newsletter.'
                });
            } else if (subscriber.status === 'unsubscribed') {
                // Reactivate subscription
                await connection.execute(
                    `UPDATE newsletter_subscribers 
                     SET status = 'active', subscribed_at = CURRENT_TIMESTAMP, unsubscribed_at = NULL, source = ?, ip_address = ?, user_agent = ?
                     WHERE email = ?`,
                    [source, ipAddress, userAgent, email]
                );

                // Send welcome email
                const welcomeEmail = emailTemplates.newsletterWelcome({ email });
                const emailResult = await sendEmail(
                    email,
                    welcomeEmail.subject,
                    welcomeEmail.html,
                    'newsletter'
                );

                // Log email attempt
                await connection.execute(
                    `INSERT INTO email_logs (type, recipient_email, subject, status, error_message) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        'newsletter',
                        email,
                        welcomeEmail.subject,
                        emailResult.success ? 'sent' : 'failed',
                        emailResult.success ? null : emailResult.error
                    ]
                );

                return res.json({
                    success: true,
                    message: 'Welcome back! You have been resubscribed to our newsletter.',
                    data: {
                        email,
                        emailSent: emailResult.success
                    }
                });
            }
        }

        // Insert new subscriber
        const [result] = await connection.execute(
            `INSERT INTO newsletter_subscribers (email, source, ip_address, user_agent) 
             VALUES (?, ?, ?, ?)`,
            [email, source, ipAddress, userAgent]
        );

        const subscriberId = result.insertId;

        // Send welcome email
        const welcomeEmail = emailTemplates.newsletterWelcome({ email });
        const emailResult = await sendEmail(
            email,
            welcomeEmail.subject,
            welcomeEmail.html,
            'newsletter'
        );

        // Log email attempt
        await connection.execute(
            `INSERT INTO email_logs (type, recipient_email, subject, status, error_message) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                'newsletter',
                email,
                welcomeEmail.subject,
                emailResult.success ? 'sent' : 'failed',
                emailResult.success ? null : emailResult.error
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Thank you for subscribing to our newsletter!',
            data: {
                subscriberId,
                email,
                emailSent: emailResult.success
            }
        });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your subscription. Please try again later.'
        });
    } finally {
        connection.release();
    }
};

// Unsubscribe from newsletter
const unsubscribeNewsletter = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { email } = req.body;

        // Check if email exists
        const [subscribers] = await connection.execute(
            `SELECT id, status FROM newsletter_subscribers WHERE email = ?`,
            [email]
        );

        if (subscribers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Email not found in our newsletter database.'
            });
        }

        const subscriber = subscribers[0];

        if (subscriber.status === 'unsubscribed') {
            return res.status(400).json({
                success: false,
                message: 'This email is already unsubscribed from our newsletter.'
            });
        }

        // Update subscription status
        await connection.execute(
            `UPDATE newsletter_subscribers 
             SET status = 'unsubscribed', unsubscribed_at = CURRENT_TIMESTAMP 
             WHERE email = ?`,
            [email]
        );

        res.json({
            success: true,
            message: 'You have been successfully unsubscribed from our newsletter.'
        });

    } catch (error) {
        console.error('Newsletter unsubscription error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your unsubscription. Please try again later.'
        });
    } finally {
        connection.release();
    }
};

// Get all subscribers (admin only)
const getAllSubscribers = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { page = 1, limit = 10, status = 'all' } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        console.log('Getting subscribers with params:', { page, limit, status });

        let query = `
            SELECT id, email, status, subscribed_at, unsubscribed_at, source 
            FROM newsletter_subscribers
        `;
        let countQuery = `SELECT COUNT(*) as total FROM newsletter_subscribers`;
        const queryParams = [];
        const countParams = [];

        if (status !== 'all') {
            query += ` WHERE status = ?`;
            countQuery += ` WHERE status = ?`;
            queryParams.push(status);
            countParams.push(status);
        }

        query += ` ORDER BY subscribed_at DESC LIMIT ${limitNum}`;

        console.log('Executing query:', query);
        console.log('Query params:', queryParams);
        console.log('Count query:', countQuery);
        console.log('Count params:', countParams);

        const [subscribers] = await connection.execute(query, queryParams);
        const [countResult] = await connection.execute(countQuery, countParams);
        const total = countResult[0].total;

        console.log('Query results:', { subscribersCount: subscribers.length, total });

        res.json({
            success: true,
            data: {
                subscribers,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalSubscribers: total,
                    hasNext: pageNum < Math.ceil(total / limitNum),
                    hasPrev: pageNum > 1
                }
            }
        });

    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching subscribers.',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Get subscriber by email
const getSubscriberByEmail = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { email } = req.params;

        const [subscribers] = await connection.execute(
            `SELECT * FROM newsletter_subscribers WHERE email = ?`,
            [email]
        );

        if (subscribers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }

        res.json({
            success: true,
            data: subscribers[0]
        });

    } catch (error) {
        console.error('Get subscriber by email error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the subscriber.'
        });
    } finally {
        connection.release();
    }
};

// Get newsletter statistics (admin only)
const getNewsletterStats = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        // Get total subscribers
        const [totalResult] = await connection.execute(
            `SELECT COUNT(*) as total FROM newsletter_subscribers`
        );

        // Get active subscribers
        const [activeResult] = await connection.execute(
            `SELECT COUNT(*) as active FROM newsletter_subscribers WHERE status = 'active'`
        );

        // Get unsubscribed count
        const [unsubscribedResult] = await connection.execute(
            `SELECT COUNT(*) as unsubscribed FROM newsletter_subscribers WHERE status = 'unsubscribed'`
        );

        // Get bounced count
        const [bouncedResult] = await connection.execute(
            `SELECT COUNT(*) as bounced FROM newsletter_subscribers WHERE status = 'bounced'`
        );

        // Get recent subscriptions (last 30 days)
        const [recentResult] = await connection.execute(
            `SELECT COUNT(*) as recent FROM newsletter_subscribers 
             WHERE subscribed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
        );

        // Get subscriptions by source
        const [sourceResult] = await connection.execute(
            `SELECT source, COUNT(*) as count 
             FROM newsletter_subscribers 
             GROUP BY source 
             ORDER BY count DESC`
        );

        res.json({
            success: true,
            data: {
                total: totalResult[0].total,
                active: activeResult[0].active,
                unsubscribed: unsubscribedResult[0].unsubscribed,
                bounced: bouncedResult[0].bounced,
                recent: recentResult[0].recent,
                bySource: sourceResult
            }
        });

    } catch (error) {
        console.error('Get newsletter stats error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching newsletter statistics.'
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    subscribeNewsletter,
    unsubscribeNewsletter,
    getAllSubscribers,
    getSubscriberByEmail,
    getNewsletterStats
};
