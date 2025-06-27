// Defines API routes for attendance management.
const express = require('express');
const { startAttendanceSession, endAttendanceSession, markStudentAttendance, getStudentCalendarAttendance } = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleWare'); // Middleware to protect routes (fixed case)

const router = express.Router();

router.post('/start', authMiddleware, startAttendanceSession); // Start a new attendance session
router.post('/:session_id/end', authMiddleware, endAttendanceSession); // End an attendance session
router.get('/subjects/:subject_id/students/:student_id/calendar', authMiddleware, getStudentCalendarAttendance); // Get attendance data for student calendar view

module.exports = router;