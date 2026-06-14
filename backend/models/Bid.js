const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bidAmount: { type: Number, required: true },
  proposal: { type: String, required: true },
  deliveryTime: { type: Number, required: true }, // days
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
}, { timestamps: true });

module.exports = mongoose.model('Bid', bidSchema);
