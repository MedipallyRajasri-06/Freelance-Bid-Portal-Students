const express = require('express');
const router = express.Router();
const { getProjectMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/project/:id', protect, getProjectMessages);
router.post('/', protect, sendMessage);

module.exports = router;
