const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration
const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Verify email configuration
const verifyEmailConfig = async () => {
    try {
        await transporter.verify();
        console.log('✅ Email server is ready to send messages');
        return true;
    } catch (error) {
        console.error('❌ Email configuration failed:', error.message);
        return false;
    }
};

// Email templates
const emailTemplates = {
    contactConfirmation: (contactData) => ({
        subject: `Thank you for contacting WorkHub Pro - ${contactData.subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">WorkHub Pro</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for reaching out!</p>
                </div>
                <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1e293b; margin-top: 0;">Hello ${contactData.name},</h2>
                    <p style="color: #64748b; line-height: 1.6;">
                        Thank you for contacting WorkHub Pro. We have received your message and will get back to you within 24 hours.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                        <h3 style="color: #1e293b; margin-top: 0;">Your Message:</h3>
                        <p style="color: #64748b; margin: 0;"><strong>Subject:</strong> ${contactData.subject}</p>
                        <p style="color: #64748b; margin: 10px 0 0 0;"><strong>Message:</strong></p>
                        <p style="color: #64748b; margin: 5px 0 0 0; white-space: pre-wrap;">${contactData.message}</p>
                    </div>
                    <p style="color: #64748b; line-height: 1.6;">
                        Our team is reviewing your inquiry and will respond with detailed information about our services and how we can help your business grow.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://workhubpro.com" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                            Visit Our Website
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                    <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0;">
                        This is an automated message. Please do not reply to this email.<br>
                        WorkHub Pro | 123 Business Street, City, State 12345 | +1 (555) 123-4567
                    </p>
                </div>
            </div>
        `
    }),

    newsletterWelcome: (subscriberData) => ({
        subject: 'Welcome to WorkHub Pro Newsletter!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">WorkHub Pro</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to our community!</p>
                </div>
                <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1e293b; margin-top: 0;">Welcome aboard!</h2>
                    <p style="color: #64748b; line-height: 1.6;">
                        Thank you for subscribing to our newsletter! You'll now receive the latest updates about our services, industry insights, and exclusive offers.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1e293b; margin-top: 0;">What to expect:</h3>
                        <ul style="color: #64748b; padding-left: 20px;">
                            <li>Weekly industry insights and trends</li>
                            <li>Exclusive offers and promotions</li>
                            <li>New product announcements</li>
                            <li>Tips and best practices for business growth</li>
                        </ul>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://workhubpro.com" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                            Explore Our Services
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                    <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 0;">
                        You can unsubscribe at any time by clicking the link below.<br>
                        <a href="https://workhubpro.com/unsubscribe?email=${subscriberData.email}" style="color: #2563eb;">Unsubscribe</a> | 
                        WorkHub Pro | 123 Business Street, City, State 12345
                    </p>
                </div>
            </div>
        `
    }),

    adminNotification: (contactData) => ({
        subject: `New Contact Form Submission - ${contactData.subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
                </div>
                <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1e293b; margin-top: 0;">Contact Details:</h2>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="color: #64748b; margin: 5px 0;"><strong>Name:</strong> ${contactData.name}</p>
                        <p style="color: #64748b; margin: 5px 0;"><strong>Email:</strong> ${contactData.email}</p>
                        <p style="color: #64748b; margin: 5px 0;"><strong>Subject:</strong> ${contactData.subject}</p>
                        <p style="color: #64748b; margin: 10px 0 0 0;"><strong>Message:</strong></p>
                        <p style="color: #64748b; margin: 5px 0 0 0; white-space: pre-wrap; background: #f1f5f9; padding: 15px; border-radius: 4px;">${contactData.message}</p>
                    </div>
                    <p style="color: #64748b; line-height: 1.6;">
                        Please respond to this inquiry as soon as possible. The customer is expecting a response within 24 hours.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="mailto:${contactData.email}?subject=Re: ${contactData.subject}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                            Reply to Customer
                        </a>
                    </div>
                </div>
            </div>
        `
    })
};

// Send email function
const sendEmail = async (to, subject, html, type = 'notification') => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'WorkHub Pro <noreply@workhubpro.com>',
            to: to,
            subject: subject,
            html: html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to}`);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    transporter,
    verifyEmailConfig,
    emailTemplates,
    sendEmail
};
