const User = require('../models/User');
const Project = require('../models/Project');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

// Add a member to a project
const addTeamMember = async (req, res) => {
  const { projectId } = req.params;
  const { email, role = 'member' } = req.body;
  const userId = req.user.userId;

  // Check if project exists and user is the owner
  const project = await Project.findOne({ _id: projectId, owner: userId });
  if (!project) {
    throw new CustomError.NotFoundError(`No project with id: ${projectId}`);
  }

  // Find user by email
  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    throw new CustomError.NotFoundError(`No user with email: ${email}`);
  }

  // Check if user is already a member
  if (project.members.includes(userToAdd._id)) {
    throw new CustomError.BadRequestError('User is already a team member');
  }

  // Add member to project
  project.members.push({
    user: userToAdd._id,
    role
  });

  await project.save();
  
  res.status(StatusCodes.OK).json({ 
    msg: 'Team member added successfully',
    member: {
      _id: userToAdd._id,
      name: userToAdd.name,
      email: userToAdd.email,
      role
    }
  });
};

// Remove a member from a project
const removeTeamMember = async (req, res) => {
  const { projectId, userId: memberId } = req.params;
  const userId = req.user.userId;

  // Check if project exists and user is the owner
  const project = await Project.findOne({ _id: projectId, owner: userId });
  if (!project) {
    throw new CustomError.NotFoundError(`No project with id: ${projectId}`);
  }

  // Check if member exists in project
  const memberIndex = project.members.findIndex(
    member => member.user.toString() === memberId
  );

  if (memberIndex === -1) {
    throw new CustomError.NotFoundError('Member not found in this project');
  }

  // Remove member
  project.members.splice(memberIndex, 1);
  await project.save();

  res.status(StatusCodes.OK).json({ msg: 'Team member removed' });
};

// Update member role
const updateMemberRole = async (req, res) => {
  const { projectId, userId: memberId } = req.params;
  const { role } = req.body;
  const userId = req.user.userId;

  // Check if project exists and user is the owner
  const project = await Project.findOne({ _id: projectId, owner: userId });
  if (!project) {
    throw new CustomError.NotFoundError(`No project with id: ${projectId}`);
  }

  // Find and update member role
  const member = project.members.find(
    member => member.user.toString() === memberId
  );

  if (!member) {
    throw new CustomError.NotFoundError('Member not found in this project');
  }

  member.role = role;
  await project.save();

  res.status(StatusCodes.OK).json({ 
    msg: 'Member role updated',
    member: {
      _id: memberId,
      role
    }
  });
};

// List all team members in a project
const getProjectTeam = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.userId;

  // Check if user has access to this project
  const project = await Project.findOne({
    _id: projectId,
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ]
  }).populate('owner', 'name email')
    .populate('members.user', 'name email');

  if (!project) {
    throw new CustomError.NotFoundError(`No project with id: ${projectId}`);
  }

  // Format response
  const team = {
    owner: {
      _id: project.owner._id,
      name: project.owner.name,
      email: project.owner.email,
      role: 'owner'
    },
    members: project.members.map(member => ({
      _id: member.user._id,
      name: member.user.name,
      email: member.user.email,
      role: member.role
    }))
  };

  res.status(StatusCodes.OK).json({ team });
};

module.exports = {
  addTeamMember,
  removeTeamMember,
  updateMemberRole,
  getProjectTeam
};
