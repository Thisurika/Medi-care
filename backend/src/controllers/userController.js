const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalReport = require('../models/MedicalReport');
const Service = require('../models/Service');

// @desc    Get all users (with optional role filter)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user,
      doctorProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user by admin
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, gender, address } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone: phone || '',
      gender: gender || '',
      address: address || '',
    });

    if (role === 'doctor') {
      await Doctor.create({
        user: user._id,
        specialization: req.body.specialization || 'General Practitioner',
        qualifications: req.body.qualifications || 'MBBS',
        experience_years: req.body.experience_years || 0,
        consultation_fee: req.body.consultation_fee || 100,
        availability_days: req.body.availability_days || ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        about: req.body.about || '',
      });
    }

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user by admin
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
    user.address = req.body.address !== undefined ? req.body.address : user.address;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'doctor') {
      await Doctor.findOneAndDelete({ user: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system dashboard statistics
// @route   GET /api/users/dashboard/stats
// @access  Private (Admin/Doctor/Patient custom view)
const getDashboardStats = async (req, res, next) => {
  try {
    const doctorCount = await Doctor.countDocuments();
    const patientCount = await User.countDocuments({ role: 'patient' });
    const appointmentCount = await Appointment.countDocuments();
    const reportCount = await MedicalReport.countDocuments();
    const serviceCount = await Service.countDocuments();

    res.json({
      success: true,
      stats: {
        doctors: doctorCount,
        patients: patientCount,
        appointments: appointmentCount,
        reports: reportCount,
        services: serviceCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDashboardStats,
};
