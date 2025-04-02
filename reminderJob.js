const cron = require('node-cron');
const nodemailer = require('nodemailer');
const ReminderTask = require('./models/ReminderTask'); 
const User = require('./models/User');
const { Op } = require('sequelize');
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
    try {
        const today = moment().format('YYYY-MM-DD');
        console.log(`🔍 Checking for tasks due on: ${today}`);

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

        const users = await User.findAll({ attributes: ['username'] });
        console.log(`👥 Found ${users.length} users to notify.`);

        if (users.length === 0) {
            console.log("⚠️ No users found in the database.");
            return;
        }

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
    } catch (error) {
        console.error('❌ Error in sending reminder emails:', error);
    }
}

// 🔥 Run When the Job is Triggered
sendReminderEmails();

console.log("⏳ Email reminder job initialized. It will send emails whenever it runs.");

module.exports = { sendReminderEmails };
