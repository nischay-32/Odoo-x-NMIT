const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');
const { getAllProjects } = require('../controllers/projectController');

// Protect all routes with authentication
router.use(authenticateUser);

// Get all projects for the logged-in user
router.get('/', getAllProjects);

module.exports = router;