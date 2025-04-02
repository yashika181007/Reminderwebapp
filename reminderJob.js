const cron = require('node-cron');
const nodemailer = require('nodemailer');
const ReminderTask = require('./models/ReminderTask'); 
const { Op } = require('sequelize');
const moment = require('moment');

console.log("🚀 Initializing email reminder service...");

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

console.log("📧 Nodemailer configured successfully.");

async function sendReminderEmails(req) {
    try {
        console.log("🔍 Checking user session...");
        if (!req.session.user) {
            console.log("⚠️ No logged-in user session found.");
            return;
        }

        const userEmail = req.session.user.email;
        console.log(`👤 Logged-in user email: ${userEmail}`);
        if (!userEmail) {
            console.log("⚠️ No email found in session.");
            return;
        }

        const today = moment().format('YYYY-MM-DD');
        console.log(`📆 Today's date: ${today}`);

        console.log("🔍 Fetching reminder tasks...");
        const tasks = await ReminderTask.findAll({
            where: {
                [Op.or]: [
                    { reminderStartDate: today },
                    { selectedReminderDates: { [Op.like]: `%${today}%` } }
                ]
            }
        });
        
        console.log(`📌 Found ${tasks.length} tasks for today's reminders.`);

        if (tasks.length === 0) {
            console.log("✅ No tasks need reminders right now.");
            return;
        }

        for (const task of tasks) {
            console.log(`📢 Preparing email for task: ${task.taskName}`);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: userEmail, // Using session-based email
                subject: `Reminder: ${task.taskName}`,
                text: `Hello,

This is a reminder that task "${task.taskName}" is due on ${task.dueDate}.

Description: ${task.taskDescription}

Best regards.`
            };
            
            console.log(`📨 Sending email to ${userEmail}...`);
            try {
                await transporter.sendMail(mailOptions);
                console.log(`✅ Email successfully sent to ${userEmail} for task: ${task.taskName}`);
            } catch (error) {
                console.error(`❌ Failed to send email to ${userEmail}:`, error);
            }
        }
    } catch (error) {
        console.error('❌ Error in sending reminder emails:', error);
    }
}

console.log("⏳ Email reminder job initialized. It will send emails whenever it runs.");

module.exports = { sendReminderEmails };
