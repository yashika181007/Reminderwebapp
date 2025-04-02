const ReminderTask = require('../models/ReminderTask');
const Category = require('../models/Category');

exports.listTasks = async (req, res) => {
    try {
        const tasks = await ReminderTask.findAll({
            include: { model: Category, attributes: ['id', 'name'] }, 
            order: [['id', 'ASC']]
        });

        res.render('taskslist', {
            tasks,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('❌ Error fetching tasks:', error);
        res.redirect('/taskslist?error=Failed to load tasks.');
    }
};

exports.addTaskForm = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.render('tasksadd', { 
            categories, 
            error: req.query.error || null 
        });
    } catch (error) {
        console.error('❌ Error loading categories:', error);
        res.redirect('/tasksadd?error=Failed to load categories.');
    }
};

exports.createTask = async (req, res) => {
    console.log("Received form data:", req.body);

    const { categoryId, taskName, taskDescription, dueDate, reminderStartDate, selectedReminderDates } = req.body;

    if (!taskName) {
        return res.redirect('/taskslist?error=Task name is required.');
    }

    try {
        const parsedReminderDates = selectedReminderDates ? selectedReminderDates.split(',') : [];

        await ReminderTask.create({
            categoryId,
            taskName,
            taskDescription,
            dueDate,
            reminderStartDate,
            selectedReminderDates: parsedReminderDates
        });

        res.redirect('/taskslist?success=Task added successfully.');
    } catch (error) {
        console.error('❌ Error adding task:', error);
        res.redirect('/taskslist?error=Error adding task.');
    }
};

exports.editTaskForm = async (req, res) => {
    try {
        const task = await ReminderTask.findByPk(req.params.id);
        const categories = await Category.findAll();

        if (!task) {
            return res.redirect('/taskslist?error=Task not found.');
        }

        res.render('tasksedit', { 
            task, 
            categories, 
            success: req.query.success || null, 
            error: req.query.error || null 
        });
    } catch (error) {
        console.error('❌ Error fetching task:', error);
        res.redirect('/taskslist?error=Failed to fetch task.');
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { categoryId, taskName, taskDescription, dueDate, reminderStartDate, selectedReminderDates } = req.body;
        const task = await ReminderTask.findByPk(req.params.id);

        if (!task) {
            return res.redirect('/taskslist?error=Task not found.');
        }

        let formattedDates;
        try {
            formattedDates = JSON.parse(selectedReminderDates);
            if (!Array.isArray(formattedDates)) throw new Error("Invalid JSON array");
        } catch (error) {
            formattedDates = selectedReminderDates.split(',').map(date => date.trim());
        }

        await task.update({
            categoryId,
            taskName,
            taskDescription,
            dueDate,
            reminderStartDate,
            selectedReminderDates: formattedDates
        });

        res.redirect('/taskslist?success=Task updated successfully.');
    } catch (error) {
        console.error('❌ Error updating task:', error);
        res.redirect('/taskslist?error=Failed to update task.');
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await ReminderTask.findByPk(id);

        if (!task) {
            return res.redirect('/taskslist?error=Task not found.');
        }

        await task.destroy();
        res.redirect('/taskslist?success=Task deleted successfully.');
    } catch (error) {
        console.error('❌ Error deleting task:', error);
        res.redirect('/taskslist?error=Error deleting task.');
    }
};
