// Handles attendance session management and record marking.
const attendanceModel = require('../models/attendanceModel');
const subjectModel = require('../models/subjectModel');
const studentModel = require('../models/studentModel');

// Starts a new attendance session for a subject.
const startAttendanceSession = async (req, res) => {
    const { subject_id, qr_code_data } = req.body;
    const facultyId = req.user.id;
    if (!subject_id) {
        return res.status(400).json({ message: 'Subject ID is required.' });
    }
    try {
        const isAssigned = await subjectModel.isFacultyAssignedToSubject(facultyId, subject_id);
        if (!isAssigned) {
            return res.status(403).json({ message: 'You are not authorized to start attendance for this subject.' });
        }
        const sessionDate = new Date().toISOString().split('T')[0];
        const startTime = new Date().toLocaleTimeString('en-US', { hour12: false });
        
        // Generate a simple unique code if not provided
        const finalQrCodeData = qr_code_data || Math.random().toString(36).substring(2, 8).toUpperCase();

        const newSession = await attendanceModel.createAttendanceSession(
            subject_id,
            facultyId,
            sessionDate,
            startTime,
            finalQrCodeData // Pass the generated code
        );
        res.status(201).json({
            message: 'Attendance session started successfully!',
            session: newSession
        });
    } catch (error) {
        console.error('Error starting attendance session:', error.message);
        res.status(500).json({ message: 'Internal server error starting session.' });
    }
};

// Ends an active attendance session.
const endAttendanceSession = async (req, res) => {
    const { session_id } = req.params;
    const facultyId = req.user.id;
    try {
        const session = await attendanceModel.findSessionById(session_id);

        if (!session || session.status !== 'open') {
            return res.status(404).json({ message: 'Active attendance session not found or already closed.' });
        }
        if (session.faculty_id !== facultyId) {
            return res.status(403).json({ message: 'You are not authorized to end this session.' });
        }
        const endTime = new Date().toLocaleTimeString('en-US', { hour12: false });
        const closedSession = await attendanceModel.closeAttendanceSession(session_id, endTime);
        res.status(200).json({
            message: 'Attendance session ended successfully!',
            session: closedSession
        });
    } catch (error) {
        console.error('Error in endAttendanceSession:', error.message);
        res.status(500).json({ message: 'Internal server error ending session.' });
    }
};

// Allows faculty to manually mark or update a student's attendance.
const markStudentAttendance = async (req, res) => {
    const { session_id } = req.params;
    const { student_id, status } = req.body;
    const facultyId = req.user.id; // From authMiddleware

    if (!student_id || !status) {
        return res.status(400).json({ message: 'Student ID and status are required.' });
    }
    const validStatuses = ['present', 'absent', 'late'];
    if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ message: `Invalid attendance status. Must be one of: ${validStatuses.join(', ')}.` });
    }

    try {
        const session = await attendanceModel.findSessionById(session_id);

        if (!session) {
            return res.status(404).json({ message: 'Attendance session not found.' });
        }

        const isAssigned = await subjectModel.isFacultyAssignedToSubject(facultyId, session.subject_id);
        if (!isAssigned) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to mark attendance for this session.' });
        }

        const isStudentEnrolled = await studentModel.isStudentEnrolledInSubject(student_id, session.subject_id);
        if (!isStudentEnrolled) {
             return res.status(400).json({ message: 'Student is not enrolled in this subject.' });
        }

        const attendedAt = new Date().toISOString();
        const record = await attendanceModel.createOrUpdateAttendanceRecord(
            session_id,
            student_id,
            status.toLowerCase(),
            attendedAt
        );

        res.status(200).json({
            message: 'Attendance recorded successfully!',
            record
        });

    } catch (error) {
        console.error('Error in markStudentAttendance:', error.message);
        res.status(500).json({ message: 'Internal server error while marking attendance.' });
    }
};

// Fetches attendance data for a student in a subject for a calendar view (used by faculty).
const getStudentCalendarAttendance = async (req, res) => {
    const { subject_id, student_id } = req.params;
    const { month, year } = req.query;
    const facultyId = req.user.id; // From authMiddleware

    if (!month || !year || isNaN(parseInt(month)) || isNaN(parseInt(year))) {
        return res.status(400).json({ message: 'Month and Year query parameters are required and must be valid numbers.' });
    }
    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);

    if (parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({ message: 'Month must be between 1 and 12.' });
    }
    if (parsedYear < 2000 || parsedYear > 2100) {
        return res.status(400).json({ message: 'Year must be a valid number (e.g., 2024).' });
    }

    try {
        const isAssigned = await subjectModel.isFacultyAssignedToSubject(facultyId, subject_id);
        if (!isAssigned) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to view attendance for this subject.' });
        }

        const isEnrolled = await studentModel.isStudentEnrolledInSubject(student_id, subject_id);
        if (!isEnrolled) {
            return res.status(404).json({ message: 'Student not found in this subject.' });
        }

        const formattedMonth = String(parsedMonth).padStart(2, '0');
        const startDate = `${parsedYear}-${formattedMonth}-01`;
        const endDate = `${parsedYear}-${formattedMonth}-${new Date(parsedYear, parsedMonth, 0).getDate()}`;

        const attendanceRecords = await attendanceModel.getStudentAttendanceBySubjectAndDateRange(
            student_id,
            subject_id,
            startDate,
            endDate
        );

        const formattedCalendarData = {};
        attendanceRecords.forEach(record => {
            const date = record.session_date.toISOString().split('T')[0];
            formattedCalendarData[date] = record.attendance_status;
        });

        res.status(200).json(formattedCalendarData);

    } catch (error) {
        console.error('Error in getStudentCalendarAttendance:', error.message);
        res.status(500).json({ message: 'Internal server error fetching calendar attendance.' });
    }
};

// The markAttendanceByStudent function is removed from here
// as it's now handled by studentController.js for authenticated students.

module.exports = {
    startAttendanceSession,
    endAttendanceSession,
    markStudentAttendance, // This is faculty manual mark
    getStudentCalendarAttendance // This is faculty view of student calendar
};