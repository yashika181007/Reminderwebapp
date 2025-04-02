const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const ReminderTask = require('./ReminderTask');

const db = { sequelize, User, Category, ReminderTask };

// Define associations AFTER models are initialized
Category.hasMany(ReminderTask, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
ReminderTask.belongsTo(Category, { foreignKey: 'categoryId' });

async function syncDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');

        await sequelize.sync({ alter: true }); // Ensures schema updates
        console.log('✅ Tables synchronized successfully.');
    } catch (error) {
        console.error('❌ Database sync error:', error);
    }
}

syncDatabase(); 

module.exports = db;
