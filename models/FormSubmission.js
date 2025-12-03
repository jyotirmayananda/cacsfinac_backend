const mongoose = require('mongoose');

const formSubmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  // For quote forms
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  service: {
    type: String,
    trim: true
  },
  formType: {
    type: String,
    enum: ['contact', 'quote', 'other'],
    default: 'other'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);

