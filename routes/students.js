const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Add new student (Admin only)
router.post('/add', async (req, res) => {
  try {
    const { name, studentId, email, className, roomNumber } = req.body;
    
    const student = new Student({
      name,
      studentId,
      email,
      className,
      roomNumber
    });
    
    await student.save();
    res.json({ 
      success: true, 
      message: 'Student added successfully',
      data: student 
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ 
        success: false, 
        message: 'Student ID or Email already exists' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  }
});

// Get all students
router.get('/all', async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json({ 
      success: true, 
      data: students 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update student
router.put('/update/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ 
      success: true, 
      message: 'Student updated successfully',
      data: updatedStudent 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Delete student
router.delete('/delete/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Student deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Student login
router.post('/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;
    
    const student = await Student.findOne({ 
      studentId,
      isActive: true 
    });
    
    if (!student) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid student ID' 
      });
    }
    
    // Check password (in real app, use bcrypt)
    if (password !== student.password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      data: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        className: student.className,
        roomNumber: student.roomNumber
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;