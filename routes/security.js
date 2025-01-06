import express from 'express';
import Log from '../models/Log.js';

const router = express.Router();

// Security dashboard
router.get('/dashboard', (req, res) => {
    res.render('security/dashboard');
});

// Get all logs
router.get('/logs/:hostelType/:type', async (req, res) => {
    try {
        const { hostelType, type } = req.params;
        const logs = await Log.find({ 
            hostelType,
            type,
        }).sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new log
router.post('/logs', async (req, res) => {
    try {
        const log = new Log(req.body);
        await log.save();
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update log (mark return for students or exit for staff)
router.put('/logs/:id', async (req, res) => {
    try {
        const log = await Log.findById(req.params.id);
        if (log.type === 'student') {
            log.returnTime = req.body.returnTime;
        } else {
            log.exitTime = req.body.exitTime;
        }
        log.status = 'completed';
        await log.save();
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete single log
router.delete('/logs/:id', async (req, res) => {
    try {
        await Log.findByIdAndDelete(req.params.id);
        res.json({ message: 'Log deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete all logs by status
router.delete('/logs/:hostelType/:type', async (req, res) => {
    try {
        const { hostelType, type } = req.params;
        const { status } = req.query;
        await Log.deleteMany({ 
            hostelType, 
            type,
            status
        });
        res.json({ message: 'Logs deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
