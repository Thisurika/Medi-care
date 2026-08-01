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
    time_slots: {
      type: [String],
      default: [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
        '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
        '04:00 PM', '04:30 PM',
      ],
    },
    unavailable_dates: {
      type: [Date],
      default: [],
    },
    hospital: {
      type: String,
      default: '',
      trim: true,
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
