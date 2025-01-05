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
  }
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
  }
});

const Block = mongoose.model('Block', blockSchema);
const Room = mongoose.model('Room', roomSchema);
const Student = mongoose.model('Student', studentSchema);

export { Block, Room, Student };

