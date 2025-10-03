const express = require('express');
const router = express.Router();
const {
    subscribeNewsletter,
    unsubscribeNewsletter,
    getAllSubscribers,
    getSubscriberByEmail,
    getNewsletterStats
} = require('../controllers/newsletterController');
const { validateNewsletterSubscription, validateUnsubscribe } = require('../middleware/validation');

// Public routes
router.post('/subscribe', validateNewsletterSubscription, subscribeNewsletter);
router.post('/unsubscribe', validateUnsubscribe, unsubscribeNewsletter);

// Admin routes (you might want to add authentication middleware here)
router.get('/admin/subscribers', getAllSubscribers);
router.get('/admin/subscribers/:email', getSubscriberByEmail);
router.get('/admin/stats', getNewsletterStats);

module.exports = router;
