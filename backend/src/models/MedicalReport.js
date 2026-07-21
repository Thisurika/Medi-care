const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    report_type: {
      type: String,
      required: [true, 'Report type is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    file_path: {
      type: String,
      required: [true, 'File path is required'],
    },
    original_filename: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
