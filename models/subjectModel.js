// Database operations for subjects.
const pool = require('../config/db');

// Fetches all subjects assigned to a specific faculty.
const getSubjectsByFacultyId = async (facultyId) => {
    const query = `
        SELECT
            s.subject_id, s.subject_name, s.year, s.section,
            d.name AS department_name, s.batch_name
        FROM subjects s
        JOIN faculty_subjects fs ON s.subject_id = fs.subject_id
        JOIN departments d ON s.department_id = d.department_id
        WHERE fs.faculty_id = $1
        ORDER BY s.year, s.section, s.subject_name;
    `;
    try {
        const result = await pool.query(query, [facultyId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching subjects by faculty ID:', error);
        throw new Error('Database query failed');
    }
};

// Checks if a faculty is assigned to a specific subject.
const isFacultyAssignedToSubject = async (facultyId, subjectId) => {
    const query = `
        SELECT EXISTS (
            SELECT 1 FROM faculty_subjects
            WHERE faculty_id = $1 AND subject_id = $2
        );
    `;
    try {
        const result = await pool.query(query, [facultyId, subjectId]);
        return result.rows[0].exists;
    } catch (error) {
        console.error('Error checking faculty subject assignment in DB:', error);
        throw new Error('Database query failed for faculty subject assignment');
    }
};

module.exports = {
    getSubjectsByFacultyId,
    isFacultyAssignedToSubject
};