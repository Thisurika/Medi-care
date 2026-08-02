const Feedback = require('../models/Feedback');
const Doctor = require('../models/Doctor');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Submit feedback/rating for a doctor
// @route   POST /api/feedback
// @access  Private (Patient)
const createFeedback = async (req, res, next) => {
  try {
    const { doctor_id, rating, comment } = req.body;

    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const feedback = await Feedback.create({
      doctor: doctor._id,
      patient: req.user._id,
      rating: Number(rating),
      comment: comment || '',
    });

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('patient', 'name profile_photo')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      });

    // Notify the doctor about the new review
    if (doctor.user) {
      createNotification({
        recipientId: doctor.user,
        type: 'feedback',
        title: 'New Review Received',
        message: `${req.user.name || 'A patient'} left a ${rating}-star review${comment ? ': "' + comment.substring(0, 80) + (comment.length > 80 ? '…' : '') + '"' : '.'}.`,
        link: '/feedback',
      });
    }

    res.status(201).json({
      success: true,
      feedback: populatedFeedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback for a specific doctor
// @route   GET /api/feedback/doctor/:doctorId
// @access  Public
const getDoctorFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ doctor: req.params.doctorId })
      .populate('patient', 'name profile_photo')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback records (Admin overview)
// @route   GET /api/feedback
// @access  Private (Admin / Doctor)
const getFeedbacks = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (doctorProfile) {
        filter.doctor = doctorProfile._id;
      } else {
        filter.doctor = null;
      }
    }

    const feedbacks = await Feedback.find(filter)
      .populate('patient', 'name email profile_photo')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name specialization' },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete feedback entry
// @route   DELETE /api/feedback/:id
// @access  Private (Admin)
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    await Feedback.findOneAndDelete({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFeedback,
  getDoctorFeedbacks,
  getFeedbacks,
  deleteFeedback,
};
