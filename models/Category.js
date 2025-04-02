const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true }
});

// Define Association
Category.associate = (models) => {
    Category.hasMany(models.ReminderTask, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
};

module.exports = Category;
