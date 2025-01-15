import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Student, Complaint, LeaveRequest, Block } from '../models/models.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to get next ID from counter file
async function getNextId(type) {
    const filePath = path.join(__dirname, '..', `${type}.txt`);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const counter = parseInt(data) || 0;
        await fs.writeFile(filePath, (counter + 1).toString());
        return counter + 1;
    } catch (error) {
        await fs.writeFile(filePath, '1');
        return 1;
    }
}

// Student login verification
router.post('/login', async (req, res) => {
  try {
    const { rollNumber, contact } = req.body;
    
    // Find student by roll number and contact
    const student = await Student.findOne({ 
      rollNumber: rollNumber,
      contact: contact 
    });

    if (!student) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // If found, send success response with student data
    res.json({ 
      success: true, 
      studentId: student._id 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get student dashboard data
router.get('/dashboard/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    .populate({
      path: 'roomId',
      populate: { path: 'blockId', select: 'name wardenName' },
  })
      .populate('complaints')
      .populate('leaveRequests');
    
    if (!student) {
      return res.status(404).render('error', { 
        message: 'Student not found' 
      });
    }

    res.render('student/dashboard', { student });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', { 
      message: 'Server error' 
    });
  }
});

// Submit complaint
router.post('/submit-complaint', async (req, res) => {
    try {
        const { studentId, details } = req.body;
        const student = await Student.findById(studentId).populate('roomId');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const complaintId = await getNextId('complaint');
        
        const complaint = new Complaint({
            complaintId: `COMP${complaintId.toString().padStart(4, '0')}`,
            studentId: student._id,
            blockId: student.roomId.blockId,
            details: details
        });

        await complaint.save();

        // Update student's complaints array
        await Student.findByIdAndUpdate(student._id, {
            $push: { complaints: complaint._id }
        });

        // Update block's complaints array
        await Block.findByIdAndUpdate(student.roomId.blockId, {
            $push: { complaints: complaint._id }
        });

        res.json({ success: true, complaint });
    } catch (error) {
        console.error('Submit complaint error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Submit leave request
router.post('/submit-leave', async (req, res) => {
    try {
        const { studentId, reason } = req.body;
        const student = await Student.findById(studentId).populate('roomId');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const requestId = await getNextId('leave');
        
        const leaveRequest = new LeaveRequest({
            requestId: `LEAVE${requestId.toString().padStart(4, '0')}`,
            studentId: student._id,
            blockId: student.roomId.blockId,
            reason: reason
        });

        await leaveRequest.save();

        // Update student's leave requests array
        await Student.findByIdAndUpdate(student._id, {
            $push: { leaveRequests: leaveRequest._id }
        });

        // Update block's leave requests array
        await Block.findByIdAndUpdate(student.roomId.blockId, {
            $push: { leaveRequests: leaveRequest._id }
        });

        res.json({ success: true, leaveRequest });
    } catch (error) {
        console.error('Submit leave request error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// Delete single complaint
router.post('/delete-complaint', async (req, res) => {
  try {
      const { studentId, complaintId } = req.body;
      const student = await Student.findById(studentId).populate('roomId');
      if (!student) {
          return res.status(404).json({ success: false, message: 'Student not found' });
      }

      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
          return res.status(404).json({ success: false, message: 'Complaint not found' });
      }

      // Remove complaint from student's complaints array
      await Student.findByIdAndUpdate(studentId, {
          $pull: { complaints: complaintId }
      });

      // Remove complaint from block's complaints array
      await Block.findByIdAndUpdate(student.roomId.blockId, {
          $pull: { complaints: complaintId }
      });

      // Delete the complaint
      await Complaint.findByIdAndDelete(complaintId);

      res.json({ success: true });
  } catch (error) {
      console.error('Delete complaint error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete single leave request
router.post('/delete-leave', async (req, res) => {
  try {
      const { studentId, requestId } = req.body;
      const student = await Student.findById(studentId).populate('roomId');
      if (!student) {
          return res.status(404).json({ success: false, message: 'Student not found' });
      }

      const leaveRequest = await LeaveRequest.findById(requestId);
      if (!leaveRequest) {
          return res.status(404).json({ success: false, message: 'Leave request not found' });
      }

      // Remove leave request from student's leave requests array
      await Student.findByIdAndUpdate(studentId, {
          $pull: { leaveRequests: requestId }
      });

      // Remove leave request from block's leave requests array
      await Block.findByIdAndUpdate(student.roomId.blockId, {
          $pull: { leaveRequests: requestId }
      });

      // Delete the leave request
      await LeaveRequest.findByIdAndDelete(requestId);

      res.json({ success: true });
  } catch (error) {
      console.error('Delete leave request error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete all complaints
router.post('/delete-all-complaints', async (req, res) => {
  try {
      const { studentId } = req.body;
      const student = await Student.findById(studentId).populate('roomId').populate('complaints');
      if (!student) {
          return res.status(404).json({ success: false, message: 'Student not found' });
      }

      // Get all complaint IDs
      const complaintIds = student.complaints.map(c => c._id);

      // Remove complaints from block's complaints array
      await Block.findByIdAndUpdate(student.roomId.blockId, {
          $pull: { complaints: { $in: complaintIds } }
      });

      // Delete all complaints
      await Complaint.deleteMany({ _id: { $in: complaintIds } });

      // Clear student's complaints array
      student.complaints = [];
      await student.save();

      res.json({ success: true });
  } catch (error) {
      console.error('Delete all complaints error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete all leave requests
router.post('/delete-all-leaves', async (req, res) => {
  try {
      const { studentId } = req.body;
      const student = await Student.findById(studentId).populate('roomId').populate('leaveRequests');
      if (!student) {
          return res.status(404).json({ success: false, message: 'Student not found' });
      }

      // Get all leave request IDs
      const requestIds = student.leaveRequests.map(r => r._id);

      // Remove leave requests from block's leave requests array
      await Block.findByIdAndUpdate(student.roomId.blockId, {
          $pull: { leaveRequests: { $in: requestIds } }
      });

      // Delete all leave requests
      await LeaveRequest.deleteMany({ _id: { $in: requestIds } });

      // Clear student's leave requests array
      student.leaveRequests = [];
      await student.save();

      res.json({ success: true });
  } catch (error) {
      console.error('Delete all leave requests error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});
export default router;