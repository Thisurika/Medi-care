const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get all doctors with optional search/filtering
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res, next) => {
  try {
    const { query, specialization, hospital, minFee, maxFee } = req.query;

    let filter = {};
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }
    if (hospital) {
      filter.hospital = { $regex: hospital, $options: 'i' };
    }
    if (minFee || maxFee) {
      filter.consultation_fee = {};
      if (minFee) filter.consultation_fee.$gte = Number(minFee);
      if (maxFee) filter.consultation_fee.$lte = Number(maxFee);
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
    if (req.body.time_slots) doctor.time_slots = req.body.time_slots;
    if (req.body.unavailable_dates !== undefined) doctor.unavailable_dates = req.body.unavailable_dates;
    if (req.body.consultation_fee !== undefined) doctor.consultation_fee = req.body.consultation_fee;
    if (req.body.hospital !== undefined) doctor.hospital = req.body.hospital;
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

// @desc    Get logged-in doctor's own schedule
// @route   GET /api/doctors/me/schedule
// @access  Private (Doctor)
const getMySchedule = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.json({
      success: true,
      schedule: {
        availability_days: doctor.availability_days,
        time_slots: doctor.time_slots,
        unavailable_dates: doctor.unavailable_dates,
        consultation_fee: doctor.consultation_fee,
        hospital: doctor.hospital,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in doctor's schedule settings
// @route   PUT /api/doctors/me/schedule
// @access  Private (Doctor)
const updateSchedule = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const { availability_days, time_slots, unavailable_dates, consultation_fee, hospital } = req.body;

    if (availability_days) doctor.availability_days = availability_days;
    if (time_slots) doctor.time_slots = time_slots;
    if (unavailable_dates !== undefined) doctor.unavailable_dates = unavailable_dates;
    if (consultation_fee !== undefined) doctor.consultation_fee = consultation_fee;
    if (hospital !== undefined) doctor.hospital = hospital;

    await doctor.save();

    res.json({
      success: true,
      schedule: {
        availability_days: doctor.availability_days,
        time_slots: doctor.time_slots,
        unavailable_dates: doctor.unavailable_dates,
        consultation_fee: doctor.consultation_fee,
        hospital: doctor.hospital,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available time slots for a doctor on a given date
// @route   GET /api/doctors/:id/available-slots?date=YYYY-MM-DD
// @access  Public
const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'date query parameter is required (YYYY-MM-DD)' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check if day-of-week is in availability_days
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const requestedDate = new Date(date);
    const dayOfWeek = dayNames[requestedDate.getUTCDay()];

    if (!doctor.availability_days.includes(dayOfWeek)) {
      return res.json({ success: true, available: false, reason: 'Doctor is not available on this day', slots: [] });
    }

    // Check if date is in unavailable_dates
    const isBlocked = doctor.unavailable_dates.some((ud) => {
      const blocked = new Date(ud);
      return (
        blocked.getUTCFullYear() === requestedDate.getUTCFullYear() &&
        blocked.getUTCMonth() === requestedDate.getUTCMonth() &&
        blocked.getUTCDate() === requestedDate.getUTCDate()
      );
    });

    if (isBlocked) {
      return res.json({ success: true, available: false, reason: 'Doctor has marked this date as unavailable', slots: [] });
    }

    // Get already-booked appointment times for this doctor on this date
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: doctor._id,
      appointment_date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'approved'] },
    });

    const bookedTimes = bookedAppointments.map((a) => a.appointment_time);

    // Filter out booked slots from doctor's time_slots
    const availableSlots = doctor.time_slots.filter((slot) => !bookedTimes.includes(slot));

    res.json({
      success: true,
      available: true,
      consultation_fee: doctor.consultation_fee,
      slots: availableSlots,
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
  getMySchedule,
  updateSchedule,
  getAvailableSlots,
};
