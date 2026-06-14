const express = require('express');
const router = express.Router();
const { createProject, getProjects, getMyProjects, getProjectById, updateProject, deleteProject } = require('../controllers/projectController');
const { protect, clientOnly, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getProjects);
router.get('/my', protect, getMyProjects);
router.get('/:id', getProjectById);
router.post('/', protect, clientOnly, createProject);
router.put('/:id', protect, clientOnly, updateProject);
router.delete('/:id', protect, clientOnly, deleteProject);

module.exports = router;
