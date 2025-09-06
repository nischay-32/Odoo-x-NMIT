const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');
const {
  getProjectTeam,
  addTeamMember,
  removeTeamMember,
  updateMemberRole
} = require('../controllers/teamController');

// All routes require authentication
router.use(authenticateUser);

// Get all team members for a project
router.get('/:projectId/members', getProjectTeam);

// Add a member to a project
router.post('/:projectId/members', addTeamMember);

// Remove a member from a project
router.delete('/:projectId/members/:memberId', removeTeamMember);

// Update member role
router.patch('/:projectId/members/:memberId/role', updateMemberRole);

module.exports = router;
