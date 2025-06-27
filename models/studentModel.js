// Database operations for students.
const pool = require('../config/db');

// Gets all students enrolled in a specific subject.
const getStudentsBySubjectId = async (subjectId) => {
    const query = `
        SELECT
            s.student_id, s.roll_number, s.name, s.email,
            d.name AS department_name
        FROM students s
        JOIN enrollments e ON s.student_id = e.student_id
        JOIN departments d ON s.department_id = d.department_id
        WHERE e.subject_id = $1
        ORDER BY s.roll_number;
    `;
    try {
        const result = await pool.query(query, [subjectId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching students by subject ID:', error);
        throw new Error('Database query failed');
    }
};

// Checks if a student is enrolled in a given subject.
const isStudentEnrolledInSubject = async (studentId, subjectId) => {
    const query = `
        SELECT EXISTS (
            SELECT 1 FROM enrollments
            WHERE student_id = $1 AND subject_id = $2
        );
    `;
    try {
        const result = await pool.query(query, [studentId, subjectId]);
        return result.rows[0].exists;
    } catch (error) {
        console.error('Error checking student enrollment in DB:', error);
        throw new Error('Database query failed');
    }
};

const findStudentByRollNumber = async (rollNumber) => {
    const query = 'SELECT * FROM students WHERE roll_number = $1';
    try {
        const result = await pool.query(query, [rollNumber]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding student by roll number:', error);
        throw new Error('Database query failed');
    }
};

// Create a new student
const createStudent = async ({ name, roll_number, email, password_hash, department_id, current_year, section }) => {
    const query = `
        INSERT INTO students (name, roll_number, email, password_hash, department_id, current_year, section)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    try {
        const result = await pool.query(query, [name, roll_number, email, password_hash, department_id, current_year, section]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating student:', error);
        throw new Error('Database insert failed');
    }
};

module.exports = {
    getStudentsBySubjectId,
    isStudentEnrolledInSubject,
    findStudentByRollNumber,
    createStudent
};