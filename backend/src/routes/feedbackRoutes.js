const express = require('express');
const router = express.Router();
const {
  createFeedback,
  getDoctorFeedbacks,
  getFeedbacks,
  deleteFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getFeedbacks)
  .post(protect, authorize('patient'), createFeedback);

router.get('/doctor/:doctorId', getDoctorFeedbacks);
router.delete('/:id', protect, authorize('admin'), deleteFeedback);

module.exports = router;
