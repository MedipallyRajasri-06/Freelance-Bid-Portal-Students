const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');

// POST /api/milestones
const createMilestone = async (req, res) => {
  try {
    const { projectId, title, amount } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const milestone = await Milestone.create({ projectId, title, amount });

    if (project.assignedTo) {
      await Notification.create({
        userId: project.assignedTo,
        message: `New milestone "${title}" (₹${amount}) added to "${project.title}"`,
        type: 'milestone',
        link: `/projects/${projectId}`
      });
    }

    res.status(201).json(milestone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/milestones/project/:id
const getProjectMilestones = async (req, res) => {
  try {
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ createdAt: 1 });
    res.json(milestones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/milestones/:id/complete  (bidder/student marks work done)
const completeMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
    if (milestone.status !== 'pending')
      return res.status(400).json({ message: 'Already completed or approved' });

    milestone.status = 'completed';
    milestone.completedAt = new Date();
    await milestone.save();

    const project = await Project.findById(milestone.projectId);
    await Notification.create({
      userId: project.postedBy,
      message: `Milestone "${milestone.title}" marked complete on "${project.title}" — please review & pay`,
      type: 'milestone',
      link: `/projects/${project._id}`
    });

    res.json(milestone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/milestones/:id/upload-scanner  (bidder uploads their payment QR/scanner)
const uploadPaymentScanner = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
    if (milestone.status !== 'completed')
      return res.status(400).json({ message: 'Milestone must be completed first before uploading payment scanner' });

    const { scannerData, scannerType } = req.body;
    if (!scannerData) return res.status(400).json({ message: 'No scanner image provided' });

    milestone.paymentScanner = scannerData;
    milestone.paymentScannerType = scannerType || 'image/png';
    await milestone.save();

    // Notify client that scanner is ready
    const project = await Project.findById(milestone.projectId);
    await Notification.create({
      userId: project.postedBy,
      message: `Payment scanner uploaded for milestone "${milestone.title}" on "${project.title}" — please pay ₹${milestone.amount}`,
      type: 'milestone',
      link: `/projects/${project._id}`
    });

    res.json({ message: 'Scanner uploaded successfully', milestone });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/milestones/:id/approve  (client confirms payment & approves)
const approveMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
    if (milestone.status !== 'completed')
      return res.status(400).json({ message: 'Milestone not completed yet' });
    if (!milestone.paymentScanner)
      return res.status(400).json({ message: 'Payment incomplete: bidder has not uploaded a payment scanner yet' });

    milestone.status = 'approved';
    milestone.paymentStatus = 'paid';
    milestone.paymentConfirmedAt = new Date();
    milestone.approvedAt = new Date();
    await milestone.save();

    const project = await Project.findById(milestone.projectId);

    // Check if all milestones approved → complete project
    const allMilestones = await Milestone.find({ projectId: milestone.projectId });
    const allApproved = allMilestones.every(m => m.status === 'approved');
    if (allApproved) {
      project.status = 'completed';
      await project.save();
      if (project.assignedTo) {
        await User.findByIdAndUpdate(project.assignedTo, { $inc: { completedProjects: 1 } });
      }
    }

    if (project.assignedTo) {
      await Notification.create({
        userId: project.assignedTo,
        message: `Payment of ₹${milestone.amount} confirmed for milestone "${milestone.title}"! 💰`,
        type: 'milestone',
        link: `/projects/${project._id}`
      });
    }

    res.json({ milestone, projectCompleted: allApproved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createMilestone, getProjectMilestones, completeMilestone, uploadPaymentScanner, approveMilestone };
