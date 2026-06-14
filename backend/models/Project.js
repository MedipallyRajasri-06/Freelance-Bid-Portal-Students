const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: Number, required: true }, // days
  skillsRequired: [{ type: String }],
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed'],
    default: 'open'
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  acceptedBid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
