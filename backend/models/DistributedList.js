const mongoose = require('mongoose');

// Schema to store distributed data for each agent
const DistributedListSchema = new mongoose.Schema({
  // Reference to the agent (user) who gets this chunk
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // The actual data list assigned to this agent
  list: { type: Array, required: true },

  // Timestamp of when the file was uploaded and distributed
  uploadedAt: { type: Date, default: Date.now }
});

// Export the model for use in other files
module.exports = mongoose.model('DistributedList', DistributedListSchema);



