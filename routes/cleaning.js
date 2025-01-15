import express from 'express';
import { Block, Room, Cleaning } from '../models/models.js';

const router = express.Router();

// Authentication middleware
const authenticateCleaning = (req, res, next) => {
  const { password } = req.body;
  if (password === 'cleanbmsit') {
    next();
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
};

// Get cleaning status dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const blocks = await Block.find();
    
    // Get next reset time (3 PM today or tomorrow)
    const now = new Date();
    const resetTime = new Date();
    resetTime.setHours(15, 0, 0, 0);
    
    if (now > resetTime) {
      resetTime.setDate(resetTime.getDate() + 1);
    }
    
    const blocksData = await Promise.all(blocks.map(async (block) => {
      const rooms = await Room.find({ blockId: block._id });
      const roomIds = rooms.map(room => room._id);
      
      // Get cleaning records since last reset
      const lastReset = new Date(resetTime);
      lastReset.setDate(lastReset.getDate() - 1);
      
      const cleaningRecords = await Cleaning.find({
        roomId: { $in: roomIds },
        date: { $gte: lastReset }
      });

      const cleaningMap = new Map(
        cleaningRecords.map(record => [record.roomId.toString(), record])
      );

      const roomsWithCleaning = rooms.map(room => ({
        ...room.toObject(),
        cleaning: cleaningMap.get(room._id.toString()) || null
      }));

      return {
        ...block.toObject(),
        rooms: roomsWithCleaning
      };
    }));

    res.render('cleaning/dashboard', { 
        blocks: blocksData,
        nextReset: resetTime.getTime()
      });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark room cleaning status
router.post('/mark', authenticateCleaning, async (req, res) => {
  try {
    const { roomId, isClean, studentId } = req.body;
    
    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if the room already has a cleaning record
    const now = new Date();
    const resetTime = new Date();
    resetTime.setHours(15, 0, 0, 0);
    
    if (now > resetTime) {
      resetTime.setDate(resetTime.getDate() + 1);
    }

    const lastReset = new Date(resetTime);
    lastReset.setDate(lastReset.getDate() - 1);

    const existingCleaning = await Cleaning.findOne({
      roomId,
      date: { $gte: lastReset }
    });

    if (existingCleaning) {
      return res.status(400).json({ 
        error: 'Room cleaning status already marked for today' 
      });
    }

    // Create new cleaning record
    const cleaning = new Cleaning({
      roomId,
      isClean,
      markedBy: studentId
    });
    await cleaning.save();

    res.json({ success: true, cleaning });
  } catch (error) {
    console.error('Marking Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;