const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Service category is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    icon: {
      type: String,
      default: 'heroicon-o-heart',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Service', serviceSchema);
