const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Static method to calculate average rating for doctor
feedbackSchema.statics.calcAverageRating = async function (doctorId) {
  const stats = await this.aggregate([
    { $match: { doctor: doctorId } },
    {
      $group: {
        _id: '$doctor',
        rating_avg: { $avg: '$rating' },
        rating_count: { $sum: 1 },
      },
    },
  ]);

  try {
    const Doctor = mongoose.model('Doctor');
    if (stats.length > 0) {
      await Doctor.findByIdAndUpdate(doctorId, {
        rating_avg: Math.round(stats[0].rating_avg * 10) / 10,
        rating_count: stats[0].rating_count,
      });
    } else {
      await Doctor.findByIdAndUpdate(doctorId, {
        rating_avg: 0,
        rating_count: 0,
      });
    }
  } catch (err) {
    console.error(`[Rating Recalculation Error] ${err.message}`);
  }
};

// Recalculate average rating after save
feedbackSchema.post('save', function () {
  this.constructor.calcAverageRating(this.doctor);
});

// Recalculate average rating after delete
feedbackSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.doctor);
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
