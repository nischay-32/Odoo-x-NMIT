const Task = require('../models/Task');
const Project = require('../models/Project');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');


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


const createTask = async (req, res) => {
    const { projectId } = req.params;
    const { title, description, dueDate, priority, assignee } = req.body;
    const userId = req.user.userId;

    
    const canAccess = await hasProjectAccess(projectId, userId);
    if (!canAccess) {
        throw new CustomError.UnauthorizedError('You do not have access to this project');
    }

    
    const task = await Task.create({
        title,
        description,
        dueDate,
        priority: priority || 'medium',
        assignee: assignee || null,
        project: projectId,
        createdBy: userId
    });

    const populatedTask = await Task.findById(task._id)
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email');

    res.status(StatusCodes.CREATED).json({ task: populatedTask });
};


const getTasks = async (req, res) => {
    const { projectId } = req.params;
    const { status, assignee } = req.query;
    const userId = req.user.userId;

    
    const canAccess = await hasProjectAccess(projectId, userId);
    if (!canAccess) {
        throw new CustomError.UnauthorizedError('You do not have access to this project');
    }

    
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

    
    const canAccess = await hasProjectAccess(task.project._id, userId);
    if (!canAccess) {
        throw new CustomError.UnauthorizedError('You do not have access to this task');
    }

    res.status(StatusCodes.OK).json({ task });
};


const updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, description, dueDate, status, priority, assignee } = req.body;
    const userId = req.user.userId;

    
    const task = await Task.findById(taskId).populate('project', 'owner members');
    if (!task) {
        throw new CustomError.NotFoundError(`No task with id ${taskId}`);
    }

    
    const isProjectAdmin = task.project.owner.toString() === userId || 
        task.project.members.some(member => 
            member.user.toString() === userId && member.role === 'admin'
        );
    const isAssignee = task.assignee && task.assignee.toString() === userId;
    
    if (!isProjectAdmin && !isAssignee) {
        throw new CustomError.UnauthorizedError('Not authorized to update this task');
    }

    
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    
    
    if (assignee !== undefined) {
        if (!isProjectAdmin) {
            throw new CustomError.UnauthorizedError('Only project admins can change assignee');
        }
        task.assignee = assignee || null;
    }

    await task.save();
    
    
    const updatedTask = await Task.findById(task._id)
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email');

    res.status(StatusCodes.OK).json({ task: updatedTask });
};


const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.userId;

    // Find the task
    const task = await Task.findById(taskId).populate('project', 'owner members');
    if (!task) {
        throw new CustomError.NotFoundError(`No task with id ${taskId}`);
    }

    
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