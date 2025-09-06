const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');
const {
    getTaskStatusDistribution,
    getProjectCompletion,
    getDueDateTracking
} = require('../controllers/analyticsController');

// All routes require authentication
router.use(authenticateUser);

// Get task status distribution for a project
router.get('/projects/:projectId/analytics/status-distribution', getTaskStatusDistribution);

// Get project completion percentage
router.get('/projects/:projectId/analytics/completion', getProjectCompletion);

// Get due date tracking metrics
router.get('/projects/:projectId/analytics/due-dates', getDueDateTracking);

module.exports = router;
