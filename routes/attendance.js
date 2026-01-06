const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// ====================
// MARK ATTENDANCE
// ====================
router.post('/mark', async (req, res) => {
  try {
    const {
      studentName,
      studentId,
      className,
      roomNumber,
      status,
      mealType,
      date,
      markedBy
    } = req.body;

    if (!studentName || !studentId || !className || !roomNumber || !status || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Attendance.findOne({
      studentId,
      mealType,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) {
      existing.status = status;
      existing.markedBy = markedBy || existing.markedBy;
      await existing.save();

      return res.json({
        success: true,
        message: 'Attendance updated',
        data: existing
      });
    }

    const attendance = new Attendance({
      studentName,
      studentId,
      className,
      roomNumber,
      status,
      mealType,
      date: targetDate,
      markedBy: markedBy || 'student'
    });

    await attendance.save();

    res.json({
      success: true,
      message: 'Attendance marked',
      data: attendance
    });

  } catch (error) {
    console.error('Error in /attendance/mark:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ====================
// GET ALL ATTENDANCE (ADMIN)
// ====================
router.get('/all', async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1 });
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ====================
// GET ATTENDANCE BY STUDENT + DATE
// ====================
router.get('/student/:studentId/date/:date', async (req, res) => {
  try {
    const { studentId, date } = req.params;

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      studentId,
      date: { $gte: start, $lte: end }
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ====================
// GET TODAY'S ATTENDANCE (STUDENT)
// ====================
router.get('/student/:studentId/today', async (req, res) => {
  try {
    const today = new Date();

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      studentId: req.params.studentId,
      date: { $gte: start, $lte: end }
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ====================
// GET ATTENDANCE BY DATE (ADMIN)
// ====================
router.get('/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
