const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');
const {
  addTeamMember,
  removeTeamMember,
  updateMemberRole,
  getProjectTeam
} = require('../controllers/teamController');

// All routes require authentication
router.use(authenticateUser);

// Get project team
router.get('/:projectId/team', getProjectTeam);

// Add team member
router.post('/:projectId/team', addTeamMember);

// Update team member role
router.patch('/:projectId/team/:userId', updateMemberRole);

// Remove team member
router.delete('/:projectId/team/:userId', removeTeamMember);

module.exports = router;
