const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');
const {
    createComment,
    getComments,
    updateComment,
    deleteComment
} = require('../controllers/commentController');

// All routes require authentication
router.use(authenticateUser);

// Create a new comment in a project
router.post('/projects/:projectId/comments', createComment);

// Get all comments for a project
router.get('/projects/:projectId/comments', getComments);

// Update a comment
router.patch('/comments/:commentId', updateComment);

// Delete a comment
router.delete('/comments/:commentId', deleteComment);

module.exports = router;
