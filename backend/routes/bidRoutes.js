const express = require('express');
const router = express.Router();
const { placeBid, getProjectBids, getMyBids, acceptBid } = require('../controllers/bidController');
const { protect, studentOnly, clientOnly } = require('../middleware/authMiddleware');

router.post('/', protect, studentOnly, placeBid);
router.get('/my', protect, studentOnly, getMyBids);
router.get('/project/:id', protect, getProjectBids);
router.put('/:id/accept', protect, clientOnly, acceptBid);

module.exports = router;
