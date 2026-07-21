const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all doctors with optional search/filtering
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res, next) => {
  try {
    const { query, specialization } = req.query;

    let filter = {};
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }

    let doctors = await Doctor.find(filter)
      .populate('user', 'name email phone gender address profile_photo')
      .sort({ rating_avg: -1 });

    if (query) {
      const q = query.toLowerCase();
      doctors = doctors.filter(
        (doc) =>
          (doc.user && doc.user.name.toLowerCase().includes(q)) ||
          doc.specialization.toLowerCase().includes(q) ||
          doc.qualifications.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      'user',
      'name email phone gender address profile_photo'
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new doctor profile
// @route   POST /api/doctors
// @access  Private/Admin
const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      address,
      specialization,
      qualifications,
      experience_years,
      availability_days,
      consultation_fee,
      about,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'doctor',
      phone: phone || '',
      gender: gender || '',
      address: address || '',
    });

    const doctor = await Doctor.create({
      user: user._id,
      specialization,
      qualifications: qualifications || '',
      experience_years: experience_years || 0,
      availability_days: availability_days || ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      consultation_fee: consultation_fee || 100,
      about: about || '',
    });

    const populatedDoctor = await Doctor.findById(doctor._id).populate(
      'user',
      'name email phone gender address profile_photo'
    );

    res.status(201).json({
      success: true,
      doctor: populatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private (Admin or Doctor self)
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check authorization: must be admin or the doctor themselves
    if (
      req.user.role !== 'admin' &&
      doctor.user.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to update this profile' });
    }

    // Update Doctor collection fields
    if (req.body.specialization) doctor.specialization = req.body.specialization;
    if (req.body.qualifications !== undefined) doctor.qualifications = req.body.qualifications;
    if (req.body.experience_years !== undefined) doctor.experience_years = req.body.experience_years;
    if (req.body.availability_days) doctor.availability_days = req.body.availability_days;
    if (req.body.consultation_fee !== undefined) doctor.consultation_fee = req.body.consultation_fee;
    if (req.body.about !== undefined) doctor.about = req.body.about;

    await doctor.save();

    // Update User model fields if provided
    const user = await User.findById(doctor.user);
    if (user) {
      if (req.body.name) user.name = req.body.name;
      if (req.body.phone !== undefined) user.phone = req.body.phone;
      if (req.body.gender !== undefined) user.gender = req.body.gender;
      if (req.body.address !== undefined) user.address = req.body.address;
      await user.save();
    }

    const updatedDoctor = await Doctor.findById(doctor._id).populate(
      'user',
      'name email phone gender address profile_photo'
    );

    res.json({
      success: true,
      doctor: updatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Doctor profile and associated user deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
