import express from 'express';
import { Block, Room, Student } from '../models/models.js';

const router = express.Router();

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
      parentName,
      parentContact,
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

export default router;

