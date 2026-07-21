const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, createAppointment)
  .get(protect, getAppointments);

router
  .route('/:id')
  .get(protect, getAppointmentById)
  .delete(protect, deleteAppointment);

router.put('/:id/status', protect, updateAppointmentStatus);

module.exports = router;
