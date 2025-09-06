const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addMember,
    removeMember
} = require('../controllers/projectController');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Project routes
router.route('/')
    .post(createProject)
    .get(getProjects);

router.route('/:id')
    .get(getProjectById)
    .patch(updateProject)
    .delete(deleteProject);

// Team management routes
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);

module.exports = router;