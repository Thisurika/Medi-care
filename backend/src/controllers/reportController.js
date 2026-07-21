const MedicalReport = require('../models/MedicalReport');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Upload a new medical report
// @route   POST /api/reports
// @access  Private (Doctor / Admin)
const uploadReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or document file' });
    }

    const { patient_id, report_type, description } = req.body;

    const patient = await User.findById(patient_id);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const filePath = `/uploads/reports/${req.file.filename}`;

    const report = await MedicalReport.create({
      doctor: req.user._id,
      patient: patient._id,
      report_type: report_type || 'General Lab Report',
      description: description || '',
      file_path: filePath,
      original_filename: req.file.originalname,
    });

    const populatedReport = await MedicalReport.findById(report._id)
      .populate('doctor', 'name email profile_photo')
      .populate('patient', 'name email phone');

    res.status(201).json({
      success: true,
      report: populatedReport,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports list based on user role
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'patient') {
      filter.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      // If doctor specifies patient query, show that patient's reports
      if (req.query.patient_id) {
        filter.patient = req.query.patient_id;
      } else {
        filter.doctor = req.user._id;
      }
    } else if (req.user.role === 'admin' && req.query.patient_id) {
      filter.patient = req.query.patient_id;
    }

    const reports = await MedicalReport.find(filter)
      .populate('doctor', 'name email profile_photo')
      .populate('patient', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private
const getReportById = async (req, res, next) => {
  try {
    const report = await MedicalReport.findById(req.params.id)
      .populate('doctor', 'name email profile_photo')
      .populate('patient', 'name email phone');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Access control: Patient can only view own report, Doctor can view created or patient's report, Admin can view all
    if (
      req.user.role === 'patient' &&
      report.patient._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this report' });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download medical report file
// @route   GET /api/reports/:id/download
// @access  Private
const downloadReport = async (req, res, next) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (
      req.user.role === 'patient' &&
      report.patient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this report' });
    }

    const absolutePath = path.join(__dirname, '../../', report.file_path);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    res.download(absolutePath, report.original_filename || 'medical-report.pdf');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medical report
// @route   DELETE /api/reports/:id
// @access  Private (Admin or creating Doctor)
const deleteReport = async (req, res, next) => {
  try {
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (
      req.user.role !== 'admin' &&
      report.doctor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this report' });
    }

    const absolutePath = path.join(__dirname, '../../', report.file_path);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await MedicalReport.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadReport,
  getReports,
  getReportById,
  downloadReport,
  deleteReport,
};
