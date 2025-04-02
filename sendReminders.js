require('dotenv').config();
const cron = require('node-cron');
const twilio = require('twilio');
const { Op } = require('sequelize');
const ReminderTask = require('./models/ReminderTask');
const User = require('./models/User');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendReminderSMS = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Find tasks where today matches either reminderStartDate or selectedReminderDates
        const tasks = await ReminderTask.findAll({
            where: {
                [Op.or]: [
                    { reminderStartDate: today },
                    { selectedReminderDates: { [Op.like]: `%${today}%` } }
                ]
            }
        });

        if (tasks.length === 0) {
            console.log("✅ No reminders for today.");
            return;
        }

        // Fetch all users with phone numbers
        const users = await User.findAll({ attributes: ['phone_number'] });

        if (users.length === 0) {
            console.log("❌ No users found with phone numbers.");
            return;
        }

        for (const task of tasks) {
            for (const user of users) {
                if (user.phone_number) {
                    const message = `📌 Reminder: Task "${task.taskName}" is scheduled for today!`;
                    
                    await client.messages.create({
                        body: message,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: user.phone_number
                    });

                    console.log(`✅ Reminder sent to ${user.phone_number} for task: ${task.taskName}`);
                }
            }
        }
    } catch (error) {
        console.error("❌ Error sending reminders:", error);
    }
};

// Schedule the job to run every day at 9 AM
cron.schedule('0 9 * * *', sendReminderSMS);

console.log("⏳ Reminder scheduler started...");
