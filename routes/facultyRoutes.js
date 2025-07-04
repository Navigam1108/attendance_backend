const express = require('express');
const { getMyProfile, updateMyProfile, changeMyPassword } = require('../controllers/facultyController');
const { getFacultySubjects } = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleWare'); // Faculty-specific auth middleware (fixed case)

const router = express.Router();

router.get('/me', authMiddleware, getMyProfile);
router.put('/me', authMiddleware, updateMyProfile);
router.put('/me/password', authMiddleware, changeMyPassword);
router.get('/me/subjects', authMiddleware, getFacultySubjects);

module.exports = router;