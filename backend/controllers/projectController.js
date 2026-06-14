const Project = require('../models/Project');
const Notification = require('../models/Notification');

// POST /api/projects
const createProject = async (req, res) => {
  try {
    const { title, description, budget, deadline, skillsRequired } = req.body;
    const project = await Project.create({
      title, description, budget, deadline,
      skillsRequired: skillsRequired || [],
      postedBy: req.user._id
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const Bid = require('../models/Bid');

// GET /api/projects
const getProjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.skill) filter.skillsRequired = { $in: [req.query.skill] };

    let projects = await Project.find(filter)
      .populate('postedBy', 'name email college profilePic')
      .populate('assignedTo', 'name email profilePic')
      .sort({ createdAt: -1 });

    const userId = req.user ? req.user._id.toString() : null;

    // Get list of project ids the current user has bid on
    let bidProjectIds = new Set();
    if (userId) {
      const myBids = await Bid.find({ studentId: req.user._id }).select('projectId');
      bidProjectIds = new Set(myBids.map(b => b.projectId.toString()));
    }

    projects = projects.filter((project) => {
      if (project.status === 'open') return true;

      // processing / completed (or any non-open status) — restrict visibility
      if (!userId) return false;

      const isPoster = project.postedBy && project.postedBy._id.toString() === userId;
      const isAssigned = project.assignedTo && project.assignedTo._id.toString() === userId;
      const hasBid = bidProjectIds.has(project._id.toString());

      return isPoster || isAssigned || hasBid;
    });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/projects/my
const getMyProjects = async (req, res) => {
  try {
    const filter = req.user.role === 'client'
      ? { postedBy: req.user._id }
      : { assignedTo: req.user._id };
    const projects = await Project.find(filter)
      .populate('postedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('postedBy', 'name email college profilePic rating')
      .populate('assignedTo', 'name email profilePic rating');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    Object.assign(project, req.body);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createProject, getProjects, getMyProjects, getProjectById, updateProject, deleteProject };
