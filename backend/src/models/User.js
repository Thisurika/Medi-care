const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'doctor', 'patient'],
      default: 'patient',
    },
    phone: {
      type: String,
      default: '',
      validate: {
        validator: function(v) {
          return v === '' || /^0[0-9]{9}$/.test(v);
        },
        message: 'Phone must be a valid Sri Lanka number (10 digits starting with 0, e.g. 0771234567)',
      },
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', ''],
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    profile_photo: {
      type: String,
      default: '',
    },
    medicalHistory: {
      diseases: [{ type: String }],
      allergies: [{ type: String }],
      bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], default: '' },
      height: { type: String, default: '' },
      weight: { type: String, default: '' },
      previousSurgeries: [{ type: String }],
      vaccinations: [{ type: String }]
    },
  },
  {
    timestamps: true,
  }
);

// Hash password prior to saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
