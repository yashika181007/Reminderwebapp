const express = require('express');
const { sendReminderEmails } = require('../jobs/reminderJob');

const router = express.Router();

router.get('/test-reminder', async (req, res) => {
    try {
        await sendReminderEmails();
        res.send('Reminder emails sent successfully.');
    } catch (error) {
        console.error('❌ Error testing reminders:', error);
        res.status(500).send('Failed to send reminder emails.');
    }
});

module.exports = router;
