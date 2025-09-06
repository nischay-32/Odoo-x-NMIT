const Task = require('../models/Task');
const Project = require('../models/Project');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

// Helper function to check project access
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

// 1. Get task status distribution
const getTaskStatusDistribution = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.userId;

    // Check project access
    const canAccess = await hasProjectAccess(projectId, userId);
    if (!canAccess) {
        throw new CustomError.UnauthorizedError('You do not have access to this project');
    }

    const result = await Task.aggregate([
        { $match: { project: new mongoose.Types.ObjectId(projectId) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } }
    ]);

    // Convert array to object with default values
    const distribution = {
        todo: 0,
        inprogress: 0,
        done: 0
    };

    result.forEach(item => {
        if (distribution.hasOwnProperty(item.status)) {
            distribution[item.status] = item.count;
        }
    });

    res.status(StatusCodes.OK).json(distribution);
};

// 2. Get project completion percentage
const getProjectCompletion = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.userId;

    // Check project access
    const canAccess = await hasProjectAccess(projectId, userId);
    if (!canAccess) {
        throw new CustomError.UnauthorizedError('You do not have access to this project');
    }

    const result = await Task.aggregate([
        { $match: { project: new mongoose.Types.ObjectId(projectId) } },
        { 
            $group: {
                _id: null,
                total: { $sum: 1 },
                completed: { 
                    $sum: { 
                        $cond: [{ $eq: ["$status", "done"] }, 1, 0] 
                    } 
                }
            } 
        }
    ]);

    const completion = result.length > 0 
        ? Math.round((result[0].completed / result[0].total) * 100) 
        : 0;

    res.status(StatusCodes.OK).json({ completion });
};

// 3. Get due date tracking metrics
const getDueDateTracking = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.userId;

    // Check project access
    const canAccess = await hasProjectAccess(projectId, userId);
    if (!canAccess) {
        throw new CustomError.UnauthorizedError('You do not have access to this project');
    }

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const tasks = await Task.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId),
                status: { $ne: 'done' },
                dueDate: { $exists: true }
            }
        },
        {
            $project: {
                isOverdue: { $lt: ["$dueDate", today] },
                isUpcoming: { 
                    $and: [
                        { $gte: ["$dueDate", today] },
                        { $lte: ["$dueDate", nextWeek] }
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                overdue: { $sum: { $cond: ["$isOverdue", 1, 0] } },
                upcoming: { $sum: { $cond: ["$isUpcoming", 1, 0] } }
            }
        }
    ]);

    const result = tasks.length > 0 
        ? { overdue: tasks[0].overdue, upcoming: tasks[0].upcoming }
        : { overdue: 0, upcoming: 0 };

    res.status(StatusCodes.OK).json(result);
};

module.exports = {
    getTaskStatusDistribution,
    getProjectCompletion,
    getDueDateTracking
};
