// Database operations for faculty users.
const pool = require('../config/db'); // PostgreSQL connection pool

// Finds a faculty user by email in the 'faculties' table.
const findFacultyByEmail = async (email) => {
    const query = 'SELECT * FROM faculties WHERE email = $1';
    try {
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding faculty by email:', error);
        throw new Error('Database query failed');
    }
};

// Creates a new faculty record in the 'faculties' table.
const createFaculty = async (name, email, passwordHash, departmentId) => {
    const query = `
        INSERT INTO faculties (name, email, password_hash, department_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    try {
        const result = await pool.query(query, [name, email, passwordHash, departmentId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating faculty:', error);
        throw new Error('Database insertion failed');
    }
};

// Finds a faculty by their UUID ID.
const findFacultyById = async (facultyId) => {
    const query = 'SELECT faculty_id, name, email, department_id FROM faculties WHERE faculty_id = $1';
    try {
        const result = await pool.query(query, [facultyId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding faculty by ID:', error);
        throw new Error('Database query failed');
    }
};

// Updates a faculty's profile information.
const updateFacultyProfile = async (facultyId, updates) => {
    const updateFields = [];
    const queryParams = [facultyId];
    let paramIndex = 2;

    for (const key in updates) {
        if (updates.hasOwnProperty(key) && ['name', 'email', 'department_id'].includes(key)) {
            updateFields.push(`${key} = $${paramIndex++}`);
            queryParams.push(updates[key]);
        }
    }
    if (updateFields.length === 0) return null;

    const query = `
        UPDATE faculties
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE faculty_id = $1
        RETURNING faculty_id, name, email, department_id;
    `;
    try {
        const result = await pool.query(query, queryParams);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error updating faculty profile:', error);
        throw new Error('Database update failed');
    }
};

// Updates a faculty's password.
const updateFacultyPassword = async (facultyId, newHashedPassword) => {
    const query = `
        UPDATE faculties
        SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE faculty_id = $2
        RETURNING faculty_id, name, email;
    `;
    try {
        const result = await pool.query(query, [newHashedPassword, facultyId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error updating faculty password:', error);
        throw new Error('Database password update failed');
    }
};

module.exports = {
    findFacultyByEmail,
    createFaculty,
    findFacultyById,
    updateFacultyProfile,
    updateFacultyPassword
};