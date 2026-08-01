const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getMySchedule,
  updateSchedule,
  getAvailableSlots,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Schedule management (must be before /:id routes)
router.route('/me/schedule')
  .get(protect, authorize('doctor'), getMySchedule)
  .put(protect, authorize('doctor'), updateSchedule);

router
  .route('/')
  .get(getDoctors)
  .post(protect, authorize('admin'), createDoctor);

router
  .route('/:id')
  .get(getDoctorById)
  .put(protect, authorize('admin', 'doctor'), updateDoctor)
  .delete(protect, authorize('admin'), deleteDoctor);

// Available slots for booking
router.route('/:id/available-slots')
  .get(getAvailableSlots);

module.exports = router;
