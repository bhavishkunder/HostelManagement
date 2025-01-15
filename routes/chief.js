import express from 'express';
import { Block, Room } from '../models/models.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/chief/dashboard');
});

router.get('/dashboard', async (req, res) => {
  try {
    const blocks = await Block.find();
    const rooms = await Room.find().populate('blockId');
    
    const roomTypeData = {
      '1-sharing': rooms.filter(room => room.roomType === '1-sharing').length,
      '2-sharing': rooms.filter(room => room.roomType === '2-sharing').length,
      '3-sharing': rooms.filter(room => room.roomType === '3-sharing').length
    };

    const occupiedRooms = rooms.reduce((sum, room) => sum + (room.occupied || 0), 0);
    const availableRooms = rooms.length - occupiedRooms;

    res.render('chiefwardendash', { 
      blocks, 
      rooms, 
      roomTypeData: JSON.stringify(roomTypeData),
      occupancyData: JSON.stringify([occupiedRooms, availableRooms])
    });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

router.post('/blocks', async (req, res) => {
  try {
    const { name, description } = req.body;
    const block = new Block({ name, description });
    await block.save();
    res.redirect('/chief/dashboard');
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

router.delete('/blocks/:id', async (req, res) => {
  try {
    await Block.findByIdAndDelete(req.params.id);
    await Room.deleteMany({ blockId: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.post('/rooms', async (req, res) => {
  try {
    const { blockId, roomNumber, roomType, bathroomType } = req.body;
    const room = new Room({
      blockId,
      roomNumber,
      roomType,
      bathroomType
    });
    await room.save();
    await Block.findByIdAndUpdate(blockId, { $inc: { totalRooms: 1 } });
    res.redirect('/chief/dashboard');
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

router.delete('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    await Room.findByIdAndDelete(req.params.id);
    await Block.findByIdAndUpdate(room.blockId, { $inc: { totalRooms: -1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});
router.post('/allocate-warden', async (req, res) => {
  try {
    const { blockId, wardenName, wardenPassword } = req.body;

    // Store the password directly (not recommended in production)
    await Block.findByIdAndUpdate(blockId, {
      wardenName: wardenName,
      wardenPassword: wardenPassword
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/verify-warden', async (req, res) => {
  try {
    const { blockId, wardenName, wardenPassword } = req.body;
    const block = await Block.findById(blockId);

    if (!block || !block.wardenName || !block.wardenPassword) {
      return res.json({ success: false, message: 'No warden assigned to this block' });
    }

    if (block.wardenName !== wardenName || block.wardenPassword !== wardenPassword) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

