const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, skills, college, bio, github } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, skills: skills || [], college, bio, github });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      skills: user.skills, college: user.college, bio: user.bio,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      skills: user.skills, college: user.college, bio: user.bio,
      profilePic: user.profilePic, github: user.github,
      rating: user.rating, completedProjects: user.completedProjects,
      portfolioLinks: user.portfolioLinks,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, skills, college, bio, github, portfolioLinks, profilePic } = req.body;
    if (name) user.name = name;
    if (skills) user.skills = skills;
    if (college) user.college = college;
    if (bio) user.bio = bio;
    if (github) user.github = github;
    if (portfolioLinks) user.portfolioLinks = portfolioLinks;
    if (profilePic) user.profilePic = profilePic;
    const updated = await user.save();
    res.json({ ...updated._doc, password: undefined });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/user/:id (public profile)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, getUserById };
