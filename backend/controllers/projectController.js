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

module.exports = {
  getAllProjects
};