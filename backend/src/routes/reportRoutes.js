const express = require('express');
const router = express.Router();
const {
  uploadReport,
  getReports,
  getReportById,
  downloadReport,
  deleteReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .get(protect, getReports)
  .post(protect, authorize('doctor', 'admin'), upload.single('report'), uploadReport);

router
  .route('/:id')
  .get(protect, getReportById)
  .delete(protect, authorize('doctor', 'admin'), deleteReport);

router.get('/:id/download', protect, downloadReport);

module.exports = router;
