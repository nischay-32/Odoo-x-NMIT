const User = require('../models/User');
const Project = require('../models/Project');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

// Helper function to check if user is project admin
const isProjectAdmin = async (projectId, userId) => {
  const project = await Project.findOne({
    _id: projectId,
    $or: [
      { owner: userId },
      { 'members.user': userId, 'members.role': 'admin' }
    ]
  });
  return !!project;
};

// Add a member to a project
const addTeamMember = async (req, res) => {
  const { projectId } = req.params;
  const { email, role = 'member' } = req.body;
  const userId = req.user.userId;

  // Check if user is admin of the project
  const isAdmin = await isProjectAdmin(projectId, userId);
  if (!isAdmin) {
    throw new CustomError.UnauthorizedError('Only project admins can add members');
  }

  // Find user by email
  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    throw new CustomError.NotFoundError(`No user with email: ${email}`);
  }

  // Prevent adding owner as member
  if (userToAdd._id.toString() === req.user.userId) {
    throw new CustomError.BadRequestError('You are already the project owner');
  }

  // Check if user is already a member
  const project = await Project.findOne({
    _id: projectId,
    'members.user': userToAdd._id
  });

  if (project) {
    throw new CustomError.BadRequestError('User is already a team member');
  }

  // Add member to project
  await Project.findByIdAndUpdate(
    projectId,
    {
      $addToSet: {
        members: {
          user: userToAdd._id,
          role,
          joinedAt: new Date()
        }
      }
    },
    { new: true, runValidators: true }
  );
  
  const updatedProject = await Project.findById(projectId)
    .populate('members.user', 'name email');
    
  const newMember = updatedProject.members.find(
    member => member.user._id.toString() === userToAdd._id.toString()
  );

  res.status(StatusCodes.OK).json({ 
    msg: 'Team member added successfully',
    member: {
      _id: newMember.user._id,
      name: newMember.user.name,
      email: newMember.user.email,
      role: newMember.role
    }
  });
};

// Remove a member from a project
const removeTeamMember = async (req, res) => {
  const { projectId, userId: memberId } = req.params;
  const currentUserId = req.user.userId;

  // Check if current user is admin
  const isAdmin = await isProjectAdmin(projectId, currentUserId);
  if (!isAdmin) {
    throw new CustomError.UnauthorizedError('Only project admins can remove members');
  }

  // Prevent removing yourself if you're the only admin
  if (memberId === currentUserId) {
    const project = await Project.findById(projectId);
    const adminCount = project.members.filter(m => m.role === 'admin').length;
    if (adminCount <= 1) {
      throw new CustomError.BadRequestError('Cannot remove the only admin. Make another user admin first.');
    }
  }

  // Remove member
  const result = await Project.findByIdAndUpdate(
    projectId,
    { $pull: { members: { user: memberId } } },
    { new: true }
  );

  if (!result) {
    throw new CustomError.NotFoundError('Project not found');
  }

  res.status(StatusCodes.OK).json({ msg: 'Team member removed' });
};

// Update member role
const updateMemberRole = async (req, res) => {
  const { projectId, userId: memberId } = req.params;
  const { role } = req.body;
  const currentUserId = req.user.userId;

  // Check if current user is admin
  const isAdmin = await isProjectAdmin(projectId, currentUserId);
  if (!isAdmin) {
    throw new CustomError.UnauthorizedError('Only project admins can update roles');
  }

  // Prevent changing your own role if you're the only admin
  if (memberId === currentUserId) {
    const project = await Project.findById(projectId);
    const adminCount = project.members.filter(m => m.role === 'admin').length;
    if (adminCount <= 1 && role !== 'admin') {
      throw new CustomError.BadRequestError('Cannot remove the only admin. Make another user admin first.');
    }
  }

  // Update role
  const result = await Project.findOneAndUpdate(
    { 
      _id: projectId,
      'members.user': memberId
    },
    { $set: { 'members.$.role': role } },
    { new: true }
  );

  if (!result) {
    throw new CustomError.NotFoundError('Member not found in this project');
  }

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
  })
  .populate('owner', 'name email')
  .populate('members.user', 'name email');

  if (!project) {
    throw new CustomError.NotFoundError(`No project with id: ${projectId}`);
  }

  // Check if current user is admin
  const isAdmin = await isProjectAdmin(projectId, userId);
  
  // Format response
  const response = {
    team: {
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
        role: member.role,
        joinedAt: member.joinedAt
      })),
      isAdmin  // Let frontend know if current user is admin
    }
  };

  res.status(StatusCodes.OK).json(response);
};

module.exports = {
  addTeamMember,
  removeTeamMember,
  updateMemberRole,
  getProjectTeam,
  isProjectAdmin  // Export for use in other controllers if needed
};
