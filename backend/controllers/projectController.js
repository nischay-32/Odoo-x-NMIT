const Project = require('../models/Project');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

// 1. Create Project
const createProject = async (req, res) => {
    const { name, description, members = [] } = req.body;
    const owner = req.user.userId;

    // Validate required fields
    if (!name) {
        throw new CustomError.BadRequestError('Project name is required');
    }

    // Check for duplicate members and remove duplicates
    const uniqueMembers = [...new Set(members)];
    
    // Create project with owner as admin
    const project = new Project({
        name,
        description,
        owner,
        members: [
            {
                user: owner,
                role: 'admin',
                joinedAt: new Date()
            },
            ...uniqueMembers.map(userId => ({
                user: userId,
                role: 'member',
                joinedAt: new Date()
            }))
        ].filter((member, index, self) => 
            index === self.findIndex(m => 
                m.user.toString() === member.user.toString()
            )
        )
    });

    await project.save();
    
    const populatedProject = await Project.findById(project._id)
        .populate('owner', 'name email')
        .populate('members.user', 'name email');

    res.status(StatusCodes.CREATED).json({ project: populatedProject });
};

// 2. Get All Projects
const getProjects = async (req, res) => {
    const { search, status } = req.query;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {
        $or: [
            { owner: userId },
            { 'members.user': userId }
        ]
    };

    // Add search filter
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Add status filter
    if (status) {
        query.status = status;
    }

    // Get total count
    const total = await Project.countDocuments(query);

    // Get paginated projects
    let projects = await Project.find(query)
        .populate('owner', 'name email')
        .populate('members.user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    // Add role information for the current user
    projects = projects.map(project => {
        const isOwner = project.owner._id.toString() === userId;
        const membership = project.members.find(
            m => m.user._id.toString() === userId
        );
        
        return {
            ...project,
            userRole: isOwner ? 'owner' : (membership?.role || 'member')
        };
    });

    res.status(StatusCodes.OK).json({
        projects,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            limit
        }
    });
};

// 3. Get Single Project
const getProjectById = async (req, res) => {
    const { id: projectId } = req.params;
    const userId = req.user.userId;

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
        throw new CustomError.NotFoundError(`No project found with id ${projectId}`);
    }

    // Add user role information
    const isOwner = project.owner._id.toString() === userId;
    const membership = project.members.find(
        m => m.user._id.toString() === userId
    );

    const projectWithRole = {
        ...project.toObject(),
        userRole: isOwner ? 'owner' : (membership?.role || 'member')
    };

    res.status(StatusCodes.OK).json({ project: projectWithRole });
};

// 4. Update Project
const updateProject = async (req, res) => {
    const { id: projectId } = req.params;
    const { name, description, status } = req.body;
    const userId = req.user.userId;

    // Find project and verify ownership
    const project = await Project.findOne({ _id: projectId, owner: userId });
    if (!project) {
        throw new CustomError.NotFoundError(`No project found with id ${projectId}`);
    }

    // Update fields if provided
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;

    await project.save();

    const updatedProject = await Project.findById(projectId)
        .populate('owner', 'name email')
        .populate('members.user', 'name email');

    res.status(StatusCodes.OK).json({ project: updatedProject });
};

// 5. Delete Project
const deleteProject = async (req, res) => {
    const { id: projectId } = req.params;
    const userId = req.user.userId;

    const project = await Project.findOneAndDelete({ 
        _id: projectId, 
        owner: userId 
    });

    if (!project) {
        throw new CustomError.NotFoundError(
            `No project found with id ${projectId} or you don't have permission to delete it`
        );
    }

    res.status(StatusCodes.OK).json({ msg: 'Project deleted successfully' });
};

// 6. Add Member
const addMember = async (req, res) => {
    const { id: projectId } = req.params;
    const { userId: memberId } = req.body;
    const userId = req.user.userId;

    // Verify project exists and user is owner
    const project = await Project.findOne({ _id: projectId, owner: userId });
    if (!project) {
        throw new CustomError.NotFoundError(
            `No project found with id ${projectId} or you don't have permission to add members`
        );
    }

    // Check if user exists
    const user = await User.findById(memberId);
    if (!user) {
        throw new CustomError.NotFoundError(`No user found with id ${memberId}`);
    }

    // Prevent adding owner as member
    if (project.owner.toString() === memberId) {
        throw new CustomError.BadRequestError('Project owner cannot be added as a member');
    }

    // Check if user is already a member
    const isMember = project.members.some(member => 
        member.user.toString() === memberId
    );
    
    if (isMember) {
        throw new CustomError.BadRequestError('User is already a member of this project');
    }

    // Add new member
    project.members.push({
        user: memberId,
        role: 'member',
        joinedAt: new Date()
    });

    await project.save();

    const updatedProject = await Project.findById(projectId)
        .populate('owner', 'name email')
        .populate('members.user', 'name email');

    res.status(StatusCodes.OK).json({ project: updatedProject });
};

// 7. Remove Member
const removeMember = async (req, res) => {
    const { id: projectId, memberId } = req.params;
    const userId = req.user.userId;

    // Verify project exists and user is owner
    const project = await Project.findOne({ _id: projectId, owner: userId });
    if (!project) {
        throw new CustomError.NotFoundError(
            `No project found with id ${projectId} or you don't have permission to remove members`
        );
    }

    // Prevent removing owner
    if (project.owner.toString() === memberId) {
        throw new CustomError.BadRequestError('Cannot remove project owner');
    }

    // Remove member
    const initialLength = project.members.length;
    project.members = project.members.filter(
        member => member.user.toString() !== memberId
    );

    if (project.members.length === initialLength) {
        throw new CustomError.NotFoundError(
            `No member found with id ${memberId} in this project`
        );
    }

    await project.save();

    const updatedProject = await Project.findById(projectId)
        .populate('owner', 'name email')
        .populate('members.user', 'name email');

    res.status(StatusCodes.OK).json({ project: updatedProject });
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addMember,
    removeMember
};