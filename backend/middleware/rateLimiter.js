const rateLimit = require('express-rate-limit');
require('dotenv').config();

// General rate limiter
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again later.',
            retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
        });
    }
});

// Strict rate limiter for contact form
const contactFormLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 contact form submissions per 15 minutes
    message: {
        success: false,
        message: 'Too many contact form submissions. Please wait 15 minutes before trying again.',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many contact form submissions. Please wait 15 minutes before trying again.',
            retryAfter: 900
        });
    }
});

// Newsletter subscription rate limiter
const newsletterLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 newsletter subscriptions per hour
    message: {
        success: false,
        message: 'Too many newsletter subscription attempts. Please wait 1 hour before trying again.',
        retryAfter: 3600
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many newsletter subscription attempts. Please wait 1 hour before trying again.',
            retryAfter: 3600
        });
    }
});

module.exports = {
    generalLimiter,
    contactFormLimiter,
    newsletterLimiter
};
