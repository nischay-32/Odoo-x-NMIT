const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

// All routes require authentication
router.use(authenticateUser);

// Create a new task in a project
router.post('/projects/:projectId/tasks', createTask);

// Get all tasks for a project (with optional filtering)
router.get('/projects/:projectId/tasks', getTasks);

// Get a single task by ID
router.get('/tasks/:taskId', getTaskById);

// Update a task
router.patch('/tasks/:taskId', updateTask);

// Delete a task
router.delete('/tasks/:taskId', deleteTask);

module.exports = router;
