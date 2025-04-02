const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category');

const ReminderTask = sequelize.define('ReminderTask', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    categoryId: { type: DataTypes.INTEGER, allowNull: false },
    taskName: { type: DataTypes.STRING, allowNull: false },
    taskDescription: { type: DataTypes.TEXT, allowNull: true },
    dueDate: { type: DataTypes.DATEONLY, allowNull: false },
    reminderStartDate: { type: DataTypes.DATEONLY, allowNull: false },
    selectedReminderDates: { type: DataTypes.JSON, allowNull: true }
}, {
    tableName: 'ReminderTasks',
    timestamps: true
});

// Define Association
ReminderTask.associate = (models) => {
    ReminderTask.belongsTo(models.Category, { foreignKey: 'categoryId' });
};

module.exports = ReminderTask;
