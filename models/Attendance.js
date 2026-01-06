const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  studentName: String,
  studentId: String,
  className: String,
  roomNumber: String,
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner'],
    required: true
  },
  markedBy: {
    type: String,
    enum: ['admin', 'student'],
    default: 'admin'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
