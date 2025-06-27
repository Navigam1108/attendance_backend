const express = require('express');
const {
    loginStudent,
    getMyStudentProfile,
    markAttendanceByLoggedInStudent,
    getMyAttendanceCalendar,
    registerStudent // <-- Add this
} = require('../controllers/studentController');
const studentAuthMiddleware = require('../middleware/studentAuthMiddleware'); // Student-specific auth middleware

const router = express.Router();

// Student Authentication (Public)
router.post('/auth/login', loginStudent); // Student login

// Student Registration (Public)
router.post('/auth/register', registerStudent); // Student registration

// Student Protected Routes
router.get('/me', studentAuthMiddleware, getMyStudentProfile); // Get logged-in student's profile
router.post('/attendance/mark', studentAuthMiddleware, markAttendanceByLoggedInStudent); // Mark attendance (protected)
router.get('/attendance/calendar', studentAuthMiddleware, getMyAttendanceCalendar); // Get student's own attendance calendar

module.exports = router;