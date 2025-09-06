const Project = require('../models/Project');
const User = require('../models/User'); 
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const getAllProjects = async (req, res) => {
  const userId = req.user.userId;
  const page = parseInt(req.query.page) || 1; 
  const limit = 10;
  const skip = (page - 1) * limit; 
  
 
  const total = await Project.countDocuments({
    $or: [{ owner: userId }, { members: userId }]
  });
  
  
  const projects = await Project.find({
    $or: [{ owner: userId }, { members: userId }]
  })
  .populate('owner', 'name email')
  .populate('members', 'name email')
  .sort({ createdAt: -1 }) 
  .skip(skip)
  .limit(limit);
  
  res.status(StatusCodes.OK).json({ 
    projects, 
    count: projects.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  });
};

const createProject = async (req, res) => {
  const { name, description, status = 'planning', deadline } = req.body;
  const owner = req.user.userId;

  if (!name) {
    throw new CustomError.BadRequestError('Please provide project name');
  }

  const project = await Project.create({
    name,
    description,
    owner,
    status,
    deadline,
    members: [owner] 
  });

  res.status(StatusCodes.CREATED).json({ project });
};

const getSingleProject = async (req, res) => {
  const { id: projectId } = req.params;
  const userId = req.user.userId;

  const project = await Project.findOne({
    _id: projectId,
    $or: [{ owner: userId }, { members: userId }]
  })
  .populate('owner', 'name email')
  .populate('members', 'name email');

  if (!project) {
    throw new CustomError.NotFoundError(`No project with id: ${projectId}`);
  }

  
  const isOwner = project.owner._id.toString() === userId;
  const isMember = project.members.some(member => member._id.toString() === userId);
  
  if (!isOwner && !isMember) {
    throw new CustomError.UnauthorizedError('Not authorized to access this project');
  }

  res.status(StatusCodes.OK).json({ project });
};

const updateProject = async (req, res) => {
  const { id: projectId } = req.params;
  const { name, description, status, deadline } = req.body;
  const userId = req.user.userId;

  
  const project = await Project.findOne({ _id: projectId, owner: userId });
  
  if (!project) {
    throw new CustomError.NotFoundError(`No project with id: ${projectId}`);
  }

  
  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (status) project.status = status;
  if (deadline) project.deadline = deadline;

  await project.save();
  
  res.status(StatusCodes.OK).json({ project });
};

const deleteProject = async (req, res) => {
  const { id: projectId } = req.params;
  const userId = req.user.userId;

  const project = await Project.findOne({ _id: projectId, owner: userId });
  
  if (!project) {
    throw new CustomError.NotFoundError(`No project with id: ${projectId}`);
  }

  await Project.deleteOne({ _id: projectId });
  
  res.status(StatusCodes.OK).json({ msg: 'Project removed' });
};

module.exports = {
  getAllProjects,
  createProject,
  getSingleProject,
  updateProject,
  deleteProject
};