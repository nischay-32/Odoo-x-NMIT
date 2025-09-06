const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: [true, 'Comment body is required'],
        trim: true,
        maxlength: [2000, 'Comment cannot be more than 2000 characters']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    isEdited: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for replies (child comments)
commentSchema.virtual('replies', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'parentComment',
    justOne: false
});

// Indexes for better query performance
commentSchema.index({ project: 1, createdAt: 1 });
commentSchema.index({ parentComment: 1 });

// Pre-save hook to validate project membership
commentSchema.pre('save', async function(next) {
    if (this.isNew) {
        const Project = mongoose.model('Project');
        const project = await Project.findOne({
            _id: this.project,
            $or: [
                { owner: this.author },
                { 'members.user': this.author }
            ]
        });
        
        if (!project) {
            throw new Error('You are not a member of this project');
        }

        // If this is a reply, validate parent comment exists and belongs to the same project
        if (this.parentComment) {
            const Comment = mongoose.model('Comment');
            const parent = await Comment.findOne({
                _id: this.parentComment,
                project: this.project
            });
            
            if (!parent) {
                throw new Error('Parent comment not found in this project');
            }
        }
    }
    next();
});

// Static method to check comment ownership/access
commentSchema.statics.hasAccess = async function(commentId, userId) {
    const comment = await this.findById(commentId)
        .populate('project', 'owner members');
    
    if (!comment) return { hasAccess: false, comment: null };
    
    const isAuthor = comment.author.toString() === userId.toString();
    const isProjectOwner = comment.project.owner.toString() === userId.toString();
    const isProjectAdmin = comment.project.members.some(
        member => member.user.toString() === userId.toString() && member.role === 'admin'
    );
    
    return { 
        hasAccess: isAuthor || isProjectOwner || isProjectAdmin,
        isAuthor,
        comment 
    };
};

module.exports = mongoose.model('Comment', commentSchema);
