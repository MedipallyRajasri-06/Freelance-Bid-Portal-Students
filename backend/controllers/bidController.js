const Bid = require('../models/Bid');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// POST /api/bids
const placeBid = async (req, res) => {
  try {
    const { projectId, bidAmount, proposal, deliveryTime } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.status !== 'open') return res.status(400).json({ message: 'Project is not open for bids' });

    const existingBid = await Bid.findOne({ projectId, studentId: req.user._id });
    if (existingBid) return res.status(400).json({ message: 'You already placed a bid on this project' });

    const bid = await Bid.create({ projectId, studentId: req.user._id, bidAmount, proposal, deliveryTime });

    // Notify client
    await Notification.create({
      userId: project.postedBy,
      message: `New bid of ₹${bidAmount} received on "${project.title}"`,
      type: 'bid',
      link: `/projects/${projectId}`
    });

    res.status(201).json(bid);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/projects/:id/bids
const getProjectBids = async (req, res) => {
  try {
    const bids = await Bid.find({ projectId: req.params.id })
      .populate('studentId', 'name email skills rating completedProjects profilePic college bio')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bids/my
const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ studentId: req.user._id })
      .populate('projectId', 'title budget deadline status postedBy')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bids/:id/accept
const acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    const project = await Project.findById(bid.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    // Accept this bid
    bid.status = 'accepted';
    await bid.save();

    // Reject all other bids
    await Bid.updateMany(
      { projectId: bid.projectId, _id: { $ne: bid._id } },
      { status: 'rejected' }
    );

    // Update project
    project.status = 'in_progress';
    project.assignedTo = bid.studentId;
    project.acceptedBid = bid._id;
    await project.save();

    // Notify student
    await Notification.create({
      userId: bid.studentId,
      message: `Your bid on "${project.title}" was accepted! 🎉`,
      type: 'bid',
      link: `/projects/${project._id}`
    });

    res.json({ message: 'Bid accepted, project started', bid, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { placeBid, getProjectBids, getMyBids, acceptBid };
