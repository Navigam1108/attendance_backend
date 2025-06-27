// Database operations for attendance sessions and records.
const pool = require('../config/db');

// Creates a new attendance session.
const createAttendanceSession = async (subjectId, facultyId, sessionDate, startTime, qrCodeData = null) => {
    const query = `
        INSERT INTO attendance_sessions (subject_id, faculty_id, session_date, start_time, qr_code_data)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    try {
        const result = await pool.query(query, [subjectId, facultyId, sessionDate, startTime, qrCodeData]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating attendance session in DB:', error.message);
        throw new Error('Database insertion failed for attendance session');
    }
};

// Closes an active attendance session.
const closeAttendanceSession = async (sessionId, endTime) => {
    const query = `
        UPDATE attendance_sessions
        SET end_time = $1, status = 'closed', updated_at = CURRENT_TIMESTAMP
        WHERE session_id = $2 AND status = 'open'
        RETURNING *;
    `;
    try {
        const result = await pool.query(query, [endTime, sessionId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error closing attendance session in DB:', error.message);
        throw new Error('Database update failed for attendance session');
    }
};

// Finds an active attendance session by ID.
const findActiveSessionById = async (sessionId) => {
    const query = `
        SELECT * FROM attendance_sessions
        WHERE session_id = $1 AND status = 'open';
    `;
    try {
        const result = await pool.query(query, [sessionId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding active session in DB:', error.message);
        throw new Error('Database query failed for active session');
    }
};

// Finds any attendance session by its ID (active or closed).
const findSessionById = async (sessionId) => {
    const query = `
        SELECT * FROM attendance_sessions
        WHERE session_id = $1;
    `;
    try {
        const result = await pool.query(query, [sessionId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding session by ID in DB:', error.message);
        throw new Error('Database query failed for session by ID');
    }
};

// Finds an open attendance session by QR code data.
const findOpenSessionByQrCode = async (qrCodeData) => {
    const query = `
        SELECT * FROM attendance_sessions
        WHERE qr_code_data = $1 AND status = 'open'
        LIMIT 1;
    `;
    try {
        const result = await pool.query(query, [qrCodeData]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding open session by QR code in DB:', error.message);
        throw new Error('Database query failed for open session by QR code');
    }
};

// Creates or updates an attendance record for a student in a session (UPSERT).
const createOrUpdateAttendanceRecord = async (sessionId, studentId, status, attendedAt = null) => {
    const query = `
        INSERT INTO attendance_records (session_id, student_id, status, attended_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (session_id, student_id) DO UPDATE SET
            status = EXCLUDED.status,
            attended_at = EXCLUDED.attended_at,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *;
    `;
    try {
        const result = await pool.query(query, [sessionId, studentId, status, attendedAt]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating/updating attendance record in DB:', error.message);
        throw new Error('Database operation failed for attendance record');
    }
};

// Fetches attendance records for a student in a subject within a date range.
const getStudentAttendanceBySubjectAndDateRange = async (studentId, subjectId, startDate, endDate) => {
    const query = `
        SELECT
            ar.status AS attendance_status,
            s.session_date,
            ar.attended_at
        FROM attendance_records ar
        JOIN attendance_sessions s ON ar.session_id = s.session_id
        WHERE ar.student_id = $1 AND s.subject_id = $2
            AND s.session_date BETWEEN $3 AND $4
        ORDER BY s.session_date ASC;
    `;
    try {
        const result = await pool.query(query, [studentId, subjectId, startDate, endDate]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching student attendance by date range in DB:', error.message);
        throw new Error('Database query failed for student attendance by date range');
    }
};

module.exports = {
    createAttendanceSession,
    closeAttendanceSession,
    findActiveSessionById,
    findSessionById,
    findOpenSessionByQrCode,
    createOrUpdateAttendanceRecord,
    getStudentAttendanceBySubjectAndDateRange,
};