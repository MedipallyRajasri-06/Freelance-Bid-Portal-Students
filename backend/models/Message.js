const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
}, { timestamps: true });

// Speed up fetching a project's conversation in chronological order
messageSchema.index({ projectId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
