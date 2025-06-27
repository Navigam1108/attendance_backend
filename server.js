const express = require('express');
const dotenv = require('dotenv');
const pool = require('./config/db');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3700;

app.use(express.json());
app.use(cors());

// Import Routes (Ensure these are correct)
const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const adminRoutes = require('./routes/adminRoutes'); // ADDED FOR ADMIN
const studentRoutes = require('./routes/studentRoutes'); // <-- ADD THIS LINE

// Use Routes - Ensure each main path maps to its correct router
app.use('/api/auth', authRoutes); // Handles faculty login/register
app.use('/api/faculty', facultyRoutes); // Handles faculty profile & faculty-specific GETs like /me/subjects
app.use('/api/subjects', subjectRoutes); // Handles GETs like /subjects/:id/students
app.use('/api/attendance', attendanceRoutes); // Handles attendance operations
app.use('/api/admin', adminRoutes); // Handles all admin-specific operations
app.use('/api/student', studentRoutes); // <-- ADD THIS LINE

app.get('/', (req, res) => {
    res.send('Welcome to the QuickMark API!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});