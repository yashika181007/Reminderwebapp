const express = require('express');
const router = express.Router();
const reminderTaskController = require('../controllers/reminderTaskController');

router.get('/tasksadd', reminderTaskController.addTaskForm);
router.post('/tasksadd', reminderTaskController.createTask);
router.get('/taskslist', reminderTaskController.listTasks);
router.get('/tasksedit/:id', reminderTaskController.editTaskForm);
router.post('/updatetask/:id', reminderTaskController.updateTask);
router.post('/taskdelete/:id', reminderTaskController.deleteTask);

module.exports = router;
