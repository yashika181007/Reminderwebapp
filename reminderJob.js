const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { Sequelize, QueryTypes } = require('sequelize');
const ReminderTask = require('./models/ReminderTask');
const User = require('./models/User');
const moment = require('moment');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendReminderEmails() {
    console.log("🚀 Function `sendReminderEmails` started execution.");

    try {
        const today = moment().format('YYYY-MM-DD');
        console.log(`🔍 Checking for tasks due on: ${today}`);

        // Fetch tasks with corrected SQL query
        const tasks = await ReminderTask.sequelize.query(
            `SELECT id, taskName, taskDescription, dueDate FROM ReminderTasks WHERE reminderStartDate = CURDATE()
             UNION 
             SELECT id, taskName, taskDescription, dueDate FROM ReminderTasks
             JOIN JSON_TABLE(selectedReminderDates, '$[*]' COLUMNS(value DATE PATH '$')) AS temp 
             ON temp.value = CURDATE()`,
            { type: QueryTypes.SELECT }
        );

        console.log(`📌 Found ${tasks.length} tasks for today's reminders.`);

        if (tasks.length === 0) {
            console.log("✅ No tasks need reminders right now.");
            return;
        }

        // Fetch users
        const users = await User.findAll({ attributes: ['username'] });
        console.log(`👥 Found ${users.length} users to notify.`);

        if (users.length === 0) {
            console.log("⚠️ No users found in the database.");
            return;
        }

        // Send emails
        for (const user of users) {
            console.log(`📨 Sending emails to ${user.username}...`);
            for (const task of tasks) {
                console.log(`📢 Preparing email for task: ${task.taskName}`);

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: user.username,
                    subject: `Reminder: ${task.taskName}`,
                    text: `Hello,\n\nThis is a reminder that task "${task.taskName}" is due on ${task.dueDate}.\n\nDescription: ${task.taskDescription}\n\nBest regards.`
                };

                try {
                    await transporter.sendMail(mailOptions);
                    console.log(`✅ Email successfully sent to ${user.username} for task: ${task.taskName}`);
                } catch (error) {
                    console.error(`❌ Failed to send email to ${user.username}:`, error);
                }
            }
        }

        console.log("✅ Reminder email function executed successfully.");

    } catch (error) {
        console.error('❌ Error in sending reminder emails:', error);
    }
}

// Schedule the job to run at 11:59 PM every day
cron.schedule('59 23 * * *', async () => {
    console.log("⏳ Running scheduled email reminders at 11:59 PM...");
    await sendReminderEmails();
    console.log("✅ Reminder email function executed after cron job.");
});

// Manually trigger function for debugging
sendReminderEmails();

console.log("✅ Email reminder job scheduled to run every day at 11:59 PM.");

module.exports = { sendReminderEmails };
