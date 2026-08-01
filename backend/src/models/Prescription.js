const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: false, // Optional if it's created outside a formal appointment
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g., "1 Tablet", "10ml"
        instructions: { type: String }, // e.g., "Before Food"
        timing: {
          morning: { type: Boolean, default: false },
          afternoon: { type: Boolean, default: false },
          night: { type: Boolean, default: false },
        },
        durationDays: { type: Number, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
      },
    ],
    notes: {
      type: String, // Consultation notes
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
