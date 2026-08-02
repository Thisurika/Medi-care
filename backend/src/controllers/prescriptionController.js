const mongoose = require('mongoose');
const Prescription = require('../models/Prescription');
const MedicineLog = require('../models/MedicineLog');
const PDFDocument = require('pdfkit');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Create a new prescription and generate medicine logs
// @route   POST /api/prescriptions
// @access  Private (Doctor)
const createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medicines, notes } = req.body;

    if (!medicines || medicines.length === 0) {
      return res.status(400).json({ message: 'No medicines provided' });
    }

    const prescription = new Prescription({
      patient: patientId,
      doctor: req.user._id,
      appointment: appointmentId,
      medicines,
      notes,
    });

    const createdPrescription = await prescription.save();

    // Generate Medicine Logs based on the medicines and duration
    const logsToCreate = [];
    
    for (const medicine of medicines) {
      const startParts = medicine.startDate.split('-').map(Number);
      const endParts = medicine.endDate.split('-').map(Number);

      const start = new Date(startParts[0], startParts[1] - 1, startParts[2], 0, 0, 0);
      const end = new Date(endParts[0], endParts[1] - 1, endParts[2], 23, 59, 59);

      const medId = new mongoose.Types.ObjectId();

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const scheduledDate = new Date(d);
        scheduledDate.setHours(0, 0, 0, 0);

        if (medicine.timing.morning) {
          logsToCreate.push({
            patient: patientId,
            prescription: createdPrescription._id,
            medicineId: medId,
            medicineName: medicine.name,
            scheduledDate: new Date(scheduledDate),
            timeOfDay: 'morning',
          });
        }
        if (medicine.timing.afternoon) {
          logsToCreate.push({
            patient: patientId,
            prescription: createdPrescription._id,
            medicineId: medId,
            medicineName: medicine.name,
            scheduledDate: new Date(scheduledDate),
            timeOfDay: 'afternoon',
          });
        }
        if (medicine.timing.night) {
          logsToCreate.push({
            patient: patientId,
            prescription: createdPrescription._id,
            medicineId: medId,
            medicineName: medicine.name,
            scheduledDate: new Date(scheduledDate),
            timeOfDay: 'night',
          });
        }
      }
    }

    if (logsToCreate.length > 0) {
      await MedicineLog.insertMany(logsToCreate);
    }

    // Notify the patient about the new prescription
    const medNames = medicines.map(m => m.name).join(', ');
    createNotification({
      recipientId: patientId,
      type: 'prescription',
      title: 'New Prescription',
      message: `Dr. ${req.user.name || 'Your doctor'} prescribed: ${medNames.substring(0, 100)}${medNames.length > 100 ? '…' : ''}.`,
      link: '/medicines',
    });

    res.status(201).json(createdPrescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get prescriptions (for logged in user or doctor)
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query = { patient: req.user._id };
    } else if (req.user.role === 'doctor') {
      query = { doctor: req.user._id };
    }
    
    const prescriptions = await Prescription.find(query)
      .populate('doctor', 'name email profile_photo')
      .populate('patient', 'name email profile_photo')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get medicine logs (Today's reminders)
// @route   GET /api/prescriptions/medicines/today
// @access  Private (Patient)
const getTodaysMedicines = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await MedicineLog.find({
      patient: req.user._id,
      scheduledDate: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate({ path: 'prescription', select: 'doctor', populate: { path: 'doctor', select: 'name' }});

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update medicine log status (mark as taken/skipped)
// @route   PUT /api/prescriptions/medicines/:logId
// @access  Private (Patient)
const updateMedicineLogStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const log = await MedicineLog.findById(req.params.logId);
    
    if (!log) {
      return res.status(404).json({ message: 'Medicine log not found' });
    }
    
    if (log.patient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    log.status = status;
    log.actionTime = new Date();
    await log.save();

    res.json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Download Prescription PDF
// @route   GET /api/prescriptions/:id/pdf
// @access  Private
const downloadPrescriptionPDF = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctor', 'name email phone')
      .populate('patient', 'name email phone address');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescription._id}.pdf`);
    
    doc.pipe(res);

    // PDF Content
    doc.fontSize(20).text('MediCare Plus', { align: 'center' });
    doc.fontSize(12).text('Hospital Management System', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(16).text('PRESCRIPTION', { align: 'center', underline: true });
    doc.moveDown();

    // Doctor & Patient Info
    doc.fontSize(12).text(`Doctor: Dr. ${prescription.doctor.name}`);
    doc.text(`Patient: ${prescription.patient.name}`);
    doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);
    doc.moveDown();
    
    doc.text('Medicines:');
    doc.moveDown();
    
    prescription.medicines.forEach((med, index) => {
      doc.text(`${index + 1}. ${med.name} - ${med.dosage}`);
      doc.text(`   Instructions: ${med.instructions}`);
      const timings = [];
      if (med.timing.morning) timings.push('Morning');
      if (med.timing.afternoon) timings.push('Afternoon');
      if (med.timing.night) timings.push('Night');
      doc.text(`   Timing: ${timings.join(', ')}`);
      doc.text(`   Duration: ${med.durationDays} days`);
      doc.moveDown();
    });

    if (prescription.notes) {
      doc.text('Notes:');
      doc.text(prescription.notes);
    }

    doc.end();

  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server Error generating PDF' });
    }
  }
};

module.exports = {
  createPrescription,
  getPrescriptions,
  getTodaysMedicines,
  updateMedicineLogStatus,
  downloadPrescriptionPDF
};
