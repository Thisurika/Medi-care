const mongoose = require('mongoose');

const medicineLogSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      required: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    medicineName: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'night'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'taken', 'skipped', 'missed'],
      default: 'pending',
    },
    actionTime: {
      type: Date, // When the patient marked it as taken/skipped
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MedicineLog', medicineLogSchema);
