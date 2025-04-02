const cron = require('node-cron');
const nodemailer = require('nodemailer');
const ReminderTask = require('./models/ReminderTask'); 
const { Op } = require('sequelize');
const moment = require('moment');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendReminderEmails(req) {
    try {
        if (!req.session.user || !req.session.user.email) {
            console.log("⚠️ No admin email found in session.");
            return;
        }

        const adminEmail = req.session.user.email;
        console.log(`📨 Sending reminder emails to Admin: ${adminEmail}`);

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

        for (const task of tasks) {
            console.log(`📢 Preparing email for task: ${task.taskName}`);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: adminEmail,
                subject: `Reminder: ${task.taskName}`,
                text: `Hello Admin,\n\nThis is a reminder that task "${task.taskName}" is due on ${task.dueDate}.\n\nDescription: ${task.taskDescription}\n\nBest regards.`
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`✅ Email successfully sent to Admin: ${adminEmail} for task: ${task.taskName}`);
            } catch (error) {
                console.error(`❌ Failed to send email to Admin: ${adminEmail}`, error);
            }
        }
    } catch (error) {
        console.error('❌ Error in sending reminder emails:', error);
    }
}

// ⏳ Schedule the Job (Runs Immediately & When Triggered)
cron.schedule('* * * * *', () => sendReminderEmails(global.req)); // Runs every minute

console.log("✅ Email reminder job initialized. It will send emails whenever it runs.");

module.exports = { sendReminderEmails };
