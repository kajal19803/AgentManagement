const mongoose = require('mongoose');

const DistributedListSchema = new mongoose.Schema({
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Each task now includes its own status
  list: [{
    firstName: String,     
    phone: String,
    notes: String,
    // Other fields as needed
    status: {
      type: String,
      enum: ['assigned', 'in-progress', 'completed'],
      default: 'assigned'
    }
  }],

  uploadedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('DistributedList', DistributedListSchema);
