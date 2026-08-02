const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
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

router.route('/:id')
  .get(protect, getPrescriptionById)
  .put(protect, updatePrescription)
  .delete(protect, deletePrescription);

module.exports = router;
