import express from 'express';
import { Block, Room, Student, Complaint, LeaveRequest } from '../models/models.js';
import twilio from 'twilio';
import { twilioConfig } from '../config/twilio.js';

const router = express.Router();

let twilioClient;
console.log('Checking Twilio credentials in warden.js...');
console.log('Account SID:', twilioConfig.accountSid ? 'Present' : 'Missing');
console.log('Auth Token:', twilioConfig.authToken ? 'Present' : 'Missing');
console.log('Phone Number:', twilioConfig.phoneNumber);

if (twilioConfig.accountSid && twilioConfig.authToken) {
  try {
    twilioClient = twilio(twilioConfig.accountSid, twilioConfig.authToken);
    console.log('Twilio client initialized successfully in warden.js');
  } catch (error) {
    console.error('Error initializing Twilio client:', error);
  }
} else {
  console.error('Twilio credentials are not properly set in twilioConfig');
}


router.get('/', (req, res) => {
  res.redirect('/warden/dashboard');
});

router.get('/dashboard', async (req, res) => {
  try {
    const blocks = await Block.find();
    const rooms = await Room.find().populate('blockId');
    const students = await Student.find().populate('roomId');

    res.render('wardenDash', { blocks, rooms, students });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

router.post('/allocate', async (req, res) => {
  try {
    const { roomId, name, rollNumber, course, semester, contact, parentName, parentContact, totalFee } = req.body;
    const room = await Room.findById(roomId);

    if (!room || room.occupied >= parseInt(room.roomType[0])) {
      return res.status(400).json({ success: false, message: 'Room is full or does not exist' });
    }

    const student = new Student({
      name,
      rollNumber,
      course,
      semester,
      contact,
      parentName,      // Make sure this is being passed
      parentContact,   // Make sure this is being passed
      roomId,
      feeDetails: {
          totalFee,
          pendingAmount: totalFee
      }
  });

    await student.save();
    room.occupied += 1;
    if (room.occupied === parseInt(room.roomType[0])) {
      room.status = 'full';
    }
    await room.save();

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/unallocate', async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(400).json({ success: false, message: 'Student not found' });
    }

    const room = await Room.findById(student.roomId);
    room.occupied -= 1;
    room.status = 'available';
    await room.save();

    await Student.findByIdAndDelete(studentId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/updateFee', async (req, res) => {
  try {
    const { studentId, paidAmount } = req.body;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(400).json({ success: false, message: 'Student not found' });
    }

    student.feeDetails.paidAmount += parseFloat(paidAmount);
    student.feeDetails.pendingAmount -= parseFloat(paidAmount);
    student.feeDetails.lastPaymentDate = new Date();

    await student.save();

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/student/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('roomId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/complaints/:blockId', async (req, res) => {
  try {
      const complaints = await Complaint.find({ blockId: req.params.blockId })
          .populate('studentId')
          .sort({ date: -1 });
      res.json(complaints);
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/requests/:blockId', async (req, res) => {
  try {
      const requests = await LeaveRequest.find({ blockId: req.params.blockId })
          .populate('studentId')
          .sort({ date: -1 });
      res.json(requests);
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/updateComplaint', async (req, res) => {
  try {
      const { complaintId, status } = req.body;
      const complaint = await Complaint.findByIdAndUpdate(
          complaintId,
          { status },
          { new: true }
      );
      res.json({ success: true, complaint });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/updateRequest', async (req, res) => {
  try {
      const { requestId, status } = req.body;
      const request = await LeaveRequest.findByIdAndUpdate(
          requestId,
          { status },
          { new: true }
      );
      res.json({ success: true, request });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
});
// Route to search student by roll number
router.get('/student-by-roll/:rollNumber', async (req, res) => {
  try {
      const student = await Student.findOne({ rollNumber: req.params.rollNumber });
      if (!student) {
          return res.status(404).json({ success: false, message: 'Student not found' });
      }
      console.log('Found student:', student); // Add this debug log
      res.json({ 
          success: true, 
          data: {
              name: student.name,
              parentName: student.parentName,
              parentContact: student.parentContact
          }
      });
  } catch (error) {
      console.error('Error finding student:', error);
      res.status(500).json({ success: false, message: error.message });
  }
});

// Route to send SMS
router.post('/send-message', async (req, res) => {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client is not initialized. Check your credentials.');
    }

    const { rollNumber, messageText, parentContact } = req.body;
    console.log('Received request:', { rollNumber, messageText, parentContact });
    
    // Find student
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if parentContact exists
    if (!parentContact) {
      return res.status(400).json({ success: false, message: 'Parent contact information is missing' });
    }

    const formattedParentContact = formatPhoneNumber(parentContact);
    console.log('Formatted parent contact:', formattedParentContact);
    
    if (!twilioConfig.phoneNumber) {
      throw new Error('Twilio phone number is not set in configuration');
    }

    const formattedTwilioNumber = formatPhoneNumber(twilioConfig.phoneNumber);
    console.log('Formatted Twilio number:', formattedTwilioNumber);

    // Send SMS using Twilio
    const message = await twilioClient.messages.create({
      body: messageText,
      to: formattedParentContact,
      from: '+16812215720'
    });
    console.log('Twilio message sent:', message.sid);

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to format phone numbers
function formatPhoneNumber(number) {
  if (!number) {
    throw new Error('Phone number is undefined or null');
  }

  // Convert to string in case it's a number
  number = number.toString();

  // Remove any non-digit characters
  const cleanNumber = number.replace(/\D/g, '');
  
  // If number already starts with '+91', return as is
  if (number.startsWith('+91')) {
    return number;
  }
  
  // If number starts with '91', add '+'
  if (number.startsWith('91')) {
    return '+' + number;
  }
  
  // If 10 digits, add '+91'
  if (cleanNumber.length === 10) {
    return '+91' + cleanNumber;
  }
  
  // Default case - just add '+' if missing
  return number.startsWith('+') ? number : '+' + number;
}

export default router;

