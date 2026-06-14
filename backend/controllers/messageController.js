const Message = require('../models/Message');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// Helper: only the client who posted the project or the student
// whose bid was accepted (assignedTo) may use the chat — and only
// once a student has been selected (project.assignedTo is set).
const ensureParticipant = (project, userId) => {
  if (!project) return { ok: false, status: 404, message: 'Project not found' };
  if (!project.assignedTo) {
    return { ok: false, status: 403, message: 'Chat unlocks once the client selects a student for this project' };
  }
  const uid = userId.toString();
  const isClient = project.postedBy.toString() === uid;
  const isStudent = project.assignedTo.toString() === uid;
  if (!isClient && !isStudent) {
    return { ok: false, status: 403, message: 'Not authorized to view this conversation' };
  }
  return { ok: true, isClient, isStudent };
};

// GET /api/messages/project/:id
const getProjectMessages = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const check = ensureParticipant(project, req.user._id);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const messages = await Message.find({ projectId: req.params.id })
      .populate('sender', 'name profilePic role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { projectId, text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text is required' });

    const project = await Project.findById(projectId);
    const check = ensureParticipant(project, req.user._id);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const message = await Message.create({
      projectId,
      sender: req.user._id,
      text: text.trim(),
    });

    const populated = await message.populate('sender', 'name profilePic role');

    // Notify the other participant
    const recipientId = check.isClient ? project.assignedTo : project.postedBy;
    await Notification.create({
      userId: recipientId,
      message: `New message from ${req.user.name} on "${project.title}"`,
      type: 'general',
      link: `/projects/${project._id}`,
    });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProjectMessages, sendMessage };
