const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptions,
  getTodaysMedicines,
  updateMedicineLogStatus,
  downloadPrescriptionPDF,
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createPrescription)
  .get(protect, getPrescriptions);

router.route('/medicines/today')
  .get(protect, getTodaysMedicines);

router.route('/medicines/:logId')
  .put(protect, updateMedicineLogStatus);

router.route('/:id/pdf')
  .get(protect, downloadPrescriptionPDF);

module.exports = router;
