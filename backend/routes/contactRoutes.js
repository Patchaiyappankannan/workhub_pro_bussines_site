const express = require('express');
const router = express.Router();
const {
    submitContactForm,
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact
} = require('../controllers/contactController');
const { validateContactForm } = require('../middleware/validation');
const { contactFormLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/submit', contactFormLimiter, validateContactForm, submitContactForm);

// Admin routes (you might want to add authentication middleware here)
router.get('/admin/contacts', getAllContacts);
router.get('/admin/contacts/:id', getContactById);
router.patch('/admin/contacts/:id/status', updateContactStatus);
router.delete('/admin/contacts/:id', deleteContact);

module.exports = router;
