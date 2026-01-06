const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// --------------------
// MARK ATTENDANCE
// --------------------
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
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate).setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate).setHours(23, 59, 59, 999);

    // Check for existing attendance for the same meal + student + date
    let existing = await Attendance.findOne({
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

    // Create new attendance
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

// --------------------
// GET ALL ATTENDANCE (Admin)
// --------------------
router.get('/all', async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1 });
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error in /attendance/all:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --------------------
// GET ATTENDANCE BY STUDENT + DATE (Student App)
// --------------------
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
    console.error('Error in /attendance/student/:studentId/date/:date:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --------------------
// GET TODAY'S ATTENDANCE FOR STUDENT
// --------------------
router.get('/student/:studentId/today', async (req, res) => {
  try {
    const today = new Date();
    const start = new Date(today).setHours(0, 0, 0, 0);
    const end = new Date(today).setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      studentId: req.params.studentId,
      date: { $gte: start, $lte: end }
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error in /attendance/student/:studentId/today:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --------------------
// GET ATTENDANCE BY DATE (Admin)
// --------------------
router.get('/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const start = new Date(date).setHours(0, 0, 0, 0);
    const end = new Date(date).setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error in /attendance/date/:date:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
