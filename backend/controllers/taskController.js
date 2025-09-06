const Task = require('../models/Task');
const Project = require('../models/Project');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

// Helper function to check if user has access to the project
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

// 1. Create a new task
const createTask = async (req, res) => {
    const { projectId } = req.params;
    const { title, description, dueDate, priority, assignee } = req.body;
    const userId = req.user.userId;

    // Check if user has access to the project
    const canAccess = await hasProjectAccess(projectId, userId);
    if (!canAccess) {
        throw new CustomError.UnauthorizedError('You do not have access to this project');
    }

    // Create the task
    const task = await Task.create({
        title,
        description,
        dueDate,
        priority: priority || 'medium',
        assignee: assignee || null,
        project: projectId,
        createdBy: userId
    });

    // Populate the assignee and createdBy fields for the response
    const populatedTask = await Task.findById(task._id)
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email');

    res.status(StatusCodes.CREATED).json({ task: populatedTask });
};

// 2. Get all tasks for a project
const getTasks = async (req, res) => {
    const { projectId } = req.params;
    const { status, assignee } = req.query;
    const userId = req.user.userId;

    // Check if user has access to the project
    const canAccess = await hasProjectAccess(projectId, userId);
    if (!canAccess) {
        throw new CustomError.UnauthorizedError('You do not have access to this project');
    }

    // Build the query
    const query = { project: projectId };
    
    if (status) {
        query.status = status;
    }
    
    if (assignee) {
        query.assignee = assignee;
    }

    const tasks = await Task.find(query)
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ tasks, count: tasks.length });
};

// 3. Get single task by ID
const getTaskById = async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.userId;

    const task = await Task.findById(taskId)
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email')
        .populate('project', 'name');

    if (!task) {
        throw new CustomError.NotFoundError(`No task with id ${taskId}`);
    }

    // Check if user has access to the task's project
    const canAccess = await hasProjectAccess(task.project._id, userId);
    if (!canAccess) {
        throw new CustomError.UnauthorizedError('You do not have access to this task');
    }

    res.status(StatusCodes.OK).json({ task });
};

// 4. Update task
const updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, description, dueDate, status, priority, assignee } = req.body;
    const userId = req.user.userId;

    // Find the task
    const task = await Task.findById(taskId).populate('project', 'owner members');
    if (!task) {
        throw new CustomError.NotFoundError(`No task with id ${taskId}`);
    }

    // Check if user has permission to update
    const isProjectAdmin = task.project.owner.toString() === userId || 
        task.project.members.some(member => 
            member.user.toString() === userId && member.role === 'admin'
        );
    const isAssignee = task.assignee && task.assignee.toString() === userId;
    
    if (!isProjectAdmin && !isAssignee) {
        throw new CustomError.UnauthorizedError('Not authorized to update this task');
    }

    // Update task fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    
    // Only allow assignee change by project admins
    if (assignee !== undefined) {
        if (!isProjectAdmin) {
            throw new CustomError.UnauthorizedError('Only project admins can change assignee');
        }
        task.assignee = assignee || null;
    }

    await task.save();
    
    // Populate the updated task
    const updatedTask = await Task.findById(task._id)
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email');

    res.status(StatusCodes.OK).json({ task: updatedTask });
};

// 5. Delete task
const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.userId;

    // Find the task
    const task = await Task.findById(taskId).populate('project', 'owner members');
    if (!task) {
        throw new CustomError.NotFoundError(`No task with id ${taskId}`);
    }

    // Check if user is project admin or owner
    const isProjectAdmin = task.project.owner.toString() === userId || 
        task.project.members.some(member => 
            member.user.toString() === userId && member.role === 'admin'
        );
    
    if (!isProjectAdmin) {
        throw new CustomError.UnauthorizedError('Only project admins can delete tasks');
    }

    await Task.findByIdAndDelete(taskId);
    res.status(StatusCodes.OK).json({ msg: 'Task deleted successfully' });
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};
