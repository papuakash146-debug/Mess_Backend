const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// MARK ATTENDANCE
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

    // Prevent duplicate attendance for same meal + date
    const existing = await Attendance.findOne({
      studentId,
      mealType,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999)
      }
    });

    if (existing) {
      existing.status = status;
      existing.markedBy = markedBy;
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
      date,
      markedBy
    });

    await attendance.save();

    res.json({
      success: true,
      message: 'Attendance marked',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// GET ATTENDANCE BY STUDENT + DATE
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

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// GET TODAY'S ATTENDANCE
router.get('/student/:studentId/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      studentId: req.params.studentId,
      date: { $gte: start, $lte: end }
    });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
