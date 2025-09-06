// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    status: {
        type: String,
        enum: ['todo', 'inprogress', 'done'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project is required']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1, status: 1 });

// Pre-save hook to validate assignee is part of the project
taskSchema.pre('save', async function(next) {
    if (this.isModified('assignee') && this.assignee) {
        const project = await this.model('Project').findOne({
            _id: this.project,
            'members.user': this.assignee
        });
        
        if (!project) {
            throw new Error('Assignee must be a member of the project');
        }
    }
    next();
});

// Static method to check if user has access to the task
taskSchema.statics.hasAccess = async function(taskId, userId) {
    const task = await this.findById(taskId).populate({
        path: 'project',
        select: 'members owner'
    });
    
    if (!task) return { hasAccess: false, task: null };
    
    const isMember = task.project.members.some(
        member => member.user.toString() === userId.toString()
    ) || task.project.owner.toString() === userId.toString();
    
    return { hasAccess: isMember, task };
};

module.exports = mongoose.model('Task', taskSchema);
