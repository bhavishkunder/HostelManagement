import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['student', 'staff']
  },
  hostelType: {
    type: String,
    required: true,
    enum: ['boys', 'girls']
  },
  name: {
    type: String,
    required: true
  },
  // Student-specific fields
  semester: {
    type: String,
    required: function() { return this.type === 'student'; }
  },
  exitTime: {
    type: Date,
    required: function() { return this.type === 'student'; }
  },
  returnTime: {
    type: Date,
    default: null
  },
  // Staff-specific fields
  entryTime: {
    type: Date,
    required: function() { return this.type === 'staff'; }
  },
  exitTime: {
    type: Date,
    default: null
  },
  // Common fields
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Log', logSchema);
