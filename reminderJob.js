const cron = require('node-cron');
const nodemailer = require('nodemailer');
const ReminderTask = require('../models/ReminderTask');
const User = require('../models/User');
const { Op } = require('sequelize');
const moment = require('moment');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Set in .env
        pass: process.env.EMAIL_PASS   // Set in .env
    }
});

async function sendReminderEmails() {
    try {
        const today = moment().format('YYYY-MM-DD');

        const tasks = await ReminderTask.findAll({
            where: {
                [Op.or]: [
                    { reminderStartDate: today },
                    { selectedReminderDates: { [Op.contains]: [today] } }
                ]
            }
        });

        if (tasks.length === 0) return;

        const users = await User.findAll({ attributes: ['email'] });
        const emailList = users.map(user => user.email);

        for (const task of tasks) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: emailList,
                subject: `Reminder: ${task.taskName}`,
                text: `Don't forget! Task "${task.taskName}" is due on ${task.dueDate}.\n\nDescription: ${task.taskDescription}`
            };

            await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent for task: ${task.taskName}`);
        }
    } catch (error) {
        console.error('❌ Error sending reminders:', error);
    }
}

// Schedule the job to run every day at 9 AM
cron.schedule('0 9 * * *', sendReminderEmails);

module.exports = { sendReminderEmails };
