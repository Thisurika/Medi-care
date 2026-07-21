const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    qualifications: {
      type: String,
      default: '',
    },
    experience_years: {
      type: Number,
      default: 0,
    },
    availability_days: {
      type: [String],
      default: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    },
    consultation_fee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      default: 100,
    },
    rating_avg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    rating_count: {
      type: Number,
      default: 0,
    },
    about: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Doctor', doctorSchema);
