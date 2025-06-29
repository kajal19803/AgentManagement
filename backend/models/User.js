const mongoose = require('mongoose');

// Define the schema for User collection
const userSchema = new mongoose.Schema({
  // Full name of the user
  name: { type: String, required: true, trim: true },

  // Unique email address (used for login)
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },

  // Country code like +91, +1 etc. with validation
  countryCode: { 
    type: String, 
    required: true, 
    trim: true, 
    match: [/^\+\d{1,4}$/, 'Invalid country code format'] 
  },

  // Mobile number (only digits, 7 to 15 digits allowed)
  mobile: { 
    type: String, 
    required: true, 
    match: [/^\d{7,15}$/, 'Mobile number must be 7 to 15 digits'] 
  },

  // Hashed password
  password: { type: String, required: true },

  // Role of user (admin or agent), default is agent
  role: { type: String, enum: ['admin', 'agent'], default: 'agent' },

  // Soft delete flag
  deleted: { type: Boolean, default: false },

  // Array to store login history with metadata
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ip: String,
    userAgent: String,
    location: String,
  }],
}, { 
  // Automatically include createdAt and updatedAt timestamps
  timestamps: true 
});

// Export the model for use in controllers or services
module.exports = mongoose.model('User', userSchema);

