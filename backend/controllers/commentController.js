const Comment = require('../models/Comment');
const Project = require('../models/Project');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

// Helper function to check project membership
const hasProjectAccess = async (projectId, userId) => {
    const project = await Project.findOne({
        _id: projectId,
        $or: [
            { owner: userId },
            { 'members.user': userId }
        ]
    });
    return !!project;
};

// 1. Create a new comment
const createComment = async (req, res) => {
    const { projectId } = req.params;
    const { body, parentComment } = req.body;
    const userId = req.user.userId;

    // Check if user has access to the project
    const canAccess = await hasProjectAccess(projectId, userId);
    if (!canAccess) {
        throw new CustomError.UnauthorizedError('You do not have access to this project');
    }

    // Create the comment
    const comment = await Comment.create({
        body,
        author: userId,
        project: projectId,
        parentComment: parentComment || null
    });

    // Populate the author and return the comment
    const populatedComment = await Comment.findById(comment._id)
        .populate('author', 'name email')
        .populate({
            path: 'replies',
            populate: {
                path: 'author',
                select: 'name email'
            }
        });

    // Emit WebSocket event
    if (req.io) {
        req.io.to(`project:${projectId}`).emit('comment:new', { comment: populatedComment });
    }

    res.status(StatusCodes.CREATED).json({ comment: populatedComment });
};

// 2. Get all comments for a project
const getComments = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.userId;

    // Check if user has access to the project
    const canAccess = await hasProjectAccess(projectId, userId);
    if (!canAccess) {
        throw new CustomError.UnauthorizedError('You do not have access to this project');
    }

    // Get all top-level comments (no parent) and populate replies recursively
    const comments = await Comment.find({ 
        project: projectId,
        parentComment: null 
    })
    .populate('author', 'name email')
    .populate({
        path: 'replies',
        populate: [
            { path: 'author', select: 'name email' },
            { 
                path: 'replies',
                populate: { path: 'author', select: 'name email' }
            }
        ]
    })
    .sort({ createdAt: 1 });

    res.status(StatusCodes.OK).json({ comments });
};

// 3. Update a comment
const updateComment = async (req, res) => {
    const { commentId } = req.params;
    const { body } = req.body;
    const userId = req.user.userId;

    // Find the comment and check permissions
    const { hasAccess, isAuthor, comment } = await Comment.hasAccess(commentId, userId);
    
    if (!hasAccess || !isAuthor) {
        throw new CustomError.UnauthorizedError('Not authorized to update this comment');
    }

    // Update the comment
    comment.body = body;
    comment.isEdited = true;
    await comment.save();

    // Populate author and replies for the response
    const updatedComment = await Comment.findById(comment._id)
        .populate('author', 'name email')
        .populate({
            path: 'replies',
            populate: {
                path: 'author',
                select: 'name email'
            }
        });

    // Emit WebSocket event
    if (req.io) {
        req.io.to(`project:${comment.project}`).emit('comment:updated', { comment: updatedComment });
    }

    res.status(StatusCodes.OK).json({ comment: updatedComment });
};

// 4. Delete a comment
const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.userId;

    // Check permissions
    const { hasAccess, comment } = await Comment.hasAccess(commentId, userId);
    if (!hasAccess) {
        throw new CustomError.UnauthorizedError('Not authorized to delete this comment');
    }

    // If it's a top-level comment, delete all its replies first
    if (!comment.parentComment) {
        await Comment.deleteMany({ parentComment: commentId });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Emit WebSocket event
    if (req.io) {
        req.io.to(`project:${comment.project}`).emit('comment:deleted', { commentId });
    }

    res.status(StatusCodes.OK).json({ msg: 'Comment deleted successfully' });
};

module.exports = {
    createComment,
    getComments,
    updateComment,
    deleteComment
};
