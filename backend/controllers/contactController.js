const { pool } = require('../config/database');
const { sendEmail, emailTemplates } = require('../config/email');

// Submit contact form
const submitContactForm = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { name, email, subject, message } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        console.log('Contact form submission:', { name, email, subject, message, ipAddress });

        // Insert contact form data into database
        const [result] = await connection.execute(
            `INSERT INTO contacts (name, email, subject, message) 
             VALUES (?, ?, ?, ?)`,
            [name, email, subject, message]
        );

        const contactId = result.insertId;

        // Prepare contact data for email
        const contactData = {
            id: contactId,
            name,
            email,
            subject,
            message,
            ipAddress,
            userAgent
        };

        // Send confirmation email to customer
        const confirmationEmail = emailTemplates.contactConfirmation(contactData);
        const emailResult = await sendEmail(
            email,
            confirmationEmail.subject,
            confirmationEmail.html,
            'contact'
        );

        // Log email attempt
        await connection.execute(
            `INSERT INTO email_logs (type, recipient_email, subject, status, error_message) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                'contact',
                email,
                confirmationEmail.subject,
                emailResult.success ? 'sent' : 'failed',
                emailResult.success ? null : emailResult.error
            ]
        );

        // Send notification email to admin (if configured)
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
            const adminNotification = emailTemplates.adminNotification(contactData);
            const adminEmailResult = await sendEmail(
                adminEmail,
                adminNotification.subject,
                adminNotification.html,
                'notification'
            );

            // Log admin email attempt
            await connection.execute(
                `INSERT INTO email_logs (type, recipient_email, subject, status, error_message) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    'notification',
                    adminEmail,
                    adminNotification.subject,
                    adminEmailResult.success ? 'sent' : 'failed',
                    adminEmailResult.success ? null : adminEmailResult.error
                ]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Thank you for your message! We will get back to you within 24 hours.',
            data: {
                contactId,
                emailSent: emailResult.success
            }
        });

    } catch (error) {
        console.error('Contact form submission error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState
        });
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request. Please try again later.',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Get all contacts (admin only)
const getAllContacts = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { page = 1, limit = 10, status = 'all' } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;

        console.log('Getting contacts with params:', { page, limit, status });

        let query = `
            SELECT id, name, email, subject, status, created_at, updated_at 
            FROM contacts
        `;
        let countQuery = `SELECT COUNT(*) as total FROM contacts`;
        const queryParams = [];
        const countParams = [];

        if (status !== 'all') {
            query += ` WHERE status = ?`;
            countQuery += ` WHERE status = ?`;
            queryParams.push(status);
            countParams.push(status);
        }

        query += ` ORDER BY created_at DESC LIMIT ${limitNum}`;

        console.log('Executing query:', query);
        console.log('Query params:', queryParams);
        console.log('Count query:', countQuery);
        console.log('Count params:', countParams);

        const [contacts] = await connection.execute(query, queryParams);
        const [countResult] = await connection.execute(countQuery, countParams);
        const total = countResult[0].total;

        console.log('Query results:', { contactsCount: contacts.length, total });

        res.json({
            success: true,
            data: {
                contacts,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalContacts: total,
                    hasNext: pageNum < Math.ceil(total / limitNum),
                    hasPrev: pageNum > 1
                }
            }
        });

    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching contacts.',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Get contact by ID (admin only)
const getContactById = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { id } = req.params;

        const [contacts] = await connection.execute(
            `SELECT * FROM contacts WHERE id = ?`,
            [id]
        );

        if (contacts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            data: contacts[0]
        });

    } catch (error) {
        console.error('Get contact by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the contact.'
        });
    } finally {
        connection.release();
    }
};

// Update contact status (admin only)
const updateContactStatus = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['new', 'read', 'replied', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: new, read, replied, closed'
            });
        }

        const [result] = await connection.execute(
            `UPDATE contacts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact status updated successfully'
        });

    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating the contact status.'
        });
    } finally {
        connection.release();
    }
};

// Delete contact (admin only)
const deleteContact = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { id } = req.params;

        const [result] = await connection.execute(
            `DELETE FROM contacts WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact deleted successfully'
        });

    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the contact.'
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    submitContactForm,
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact
};
