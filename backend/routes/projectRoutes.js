const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');
const { 
  getAllProjects,
  createProject,
  getSingleProject,
  updateProject,
  deleteProject 
} = require('../controllers/projectController');

// All routes require authentication
router.use(authenticateUser);

router.route('/')
  .get(getAllProjects)
  .post(createProject);

router.route('/:id')
  .get(getSingleProject)
  .patch(updateProject)
  .delete(deleteProject);

module.exports = router;