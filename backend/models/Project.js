const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  discussions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' }],
  status: { 
    type: String, 
    enum: ['planning', 'active', 'completed', 'on-hold'], 
    default: 'planning' 
  },
  deadline: Date,
  progress: { type: Number, default: 0 } // calculated field
}, { timestamps: true });
