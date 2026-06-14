const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'payment_pending', 'approved'],
    default: 'pending'
  },
  // Bidder uploads their payment QR / scanner
  paymentScanner: { type: String, default: null },       // base64 or URL
  paymentScannerType: { type: String, default: null },   // mime type
  // Client confirms payment
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  paymentConfirmedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  approvedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Milestone', milestoneSchema);
