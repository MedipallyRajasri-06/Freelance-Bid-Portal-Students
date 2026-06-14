const express = require('express');
const router = express.Router();
const {
  createMilestone,
  getProjectMilestones,
  completeMilestone,
  uploadPaymentScanner,
  approveMilestone
} = require('../controllers/milestoneController');
const { protect, clientOnly, studentOnly } = require('../middleware/authMiddleware');

router.post('/', protect, clientOnly, createMilestone);
router.get('/project/:id', protect, getProjectMilestones);
router.put('/:id/complete', protect, studentOnly, completeMilestone);
router.put('/:id/upload-scanner', protect, studentOnly, uploadPaymentScanner);
router.put('/:id/approve', protect, clientOnly, approveMilestone);

module.exports = router;
