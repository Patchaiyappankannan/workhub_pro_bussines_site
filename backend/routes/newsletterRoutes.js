const express = require('express');
const router = express.Router();
const {
    subscribeNewsletter,
    unsubscribeNewsletter
} = require('../controllers/newsletterController');
const { validateNewsletterSubscription, validateUnsubscribe } = require('../middleware/validation');

// Public routes
router.post('/subscribe', validateNewsletterSubscription, subscribeNewsletter);
router.post('/unsubscribe', validateUnsubscribe, unsubscribeNewsletter);

// Admin routes removed

module.exports = router;
