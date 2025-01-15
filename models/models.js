import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  totalRooms: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  },
  wardenName: {
    type: String,
    default: ''
  },
  wardenPassword: {
    type: String,
    default: ''
  },
  complaints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  }],
  leaveRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveRequest'
  }],
  
});

const roomSchema = new mongoose.Schema({
  blockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    required: true
  },
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  roomType: {
    type: String,
    enum: ['1-sharing', '2-sharing', '3-sharing'],
    required: true
  },
  bathroomType: {
    type: String,
    enum: ['attached', 'common'],
    required: true
  },
  occupied: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['available', 'full', 'maintenance'],
    default: 'available'
  }
});
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  course: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  parentName: {
    type: String,
    required: true
  },
  parentContact: {
    type: String,
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  feeDetails: {
    totalFee: {
      type: Number,
      required: true
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    pendingAmount: {
      type: Number,
      required: true
    },
    lastPaymentDate: {
      type: Date
    }
  },
  complaints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  }],
  leaveRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveRequest'
  }]
});

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  blockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    required: true
  },
  details: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'resolved'],
    default: 'submitted'
  }
});

const leaveRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  blockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'accepted', 'rejected'],
    default: 'submitted'
  }
});
const cleaningSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  isClean: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }
});

cleaningSchema.index({ date: 1 }, { expireAfterSeconds: 86400 }); // 24 hours

const Cleaning = mongoose.model('Cleaning', cleaningSchema);
const Block = mongoose.model('Block', blockSchema);
const Room = mongoose.model('Room', roomSchema);
const Student = mongoose.model('Student', studentSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);
const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

export { Block, Room, Student, Complaint, LeaveRequest, Cleaning};

