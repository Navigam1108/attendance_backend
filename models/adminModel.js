// Database operations for admin, department, faculty, student, and subject management.
const pool = require('../config/db');

// Admin
const findAdminByEmail = async (email) => {
    try {
        const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
        return result.rows[0];  // Return the first matching admin
    } catch (error) {
        console.error('Error in findAdminByEmail:', error);
        throw error;
    }
};

const createAdmin = async (name, email, password_hash) => {
    try {
        const result = await pool.query(
            'INSERT INTO admins (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [name, email, password_hash]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error in createAdmin:', error);
        throw error;
    }
};

// Department
const getAllDepartments = async () => {
    const result = await pool.query('SELECT * FROM departments');
    return result.rows;
};

const createDepartment = async (name) => {
    const result = await pool.query(
        'INSERT INTO departments (name) VALUES ($1) RETURNING *',
        [name]
    );
    return result.rows[0];
};

const updateDepartment = async (id, name) => {
    const result = await pool.query(
        'UPDATE departments SET name = $1 WHERE department_id = $2 RETURNING *',
        [name, id]
    );
    return result.rows[0];
};

const deleteDepartment = async (id) => {
    const result = await pool.query(
        'DELETE FROM departments WHERE department_id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

// Faculty
const getAllFaculties = async () => {
    const result = await pool.query('SELECT * FROM faculties');
    return result.rows;
};

const createFacultyByAdmin = async (name, email, password_hash, department_id) => {
    const result = await pool.query(
        'INSERT INTO faculties (name, email, password_hash, department_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, password_hash, department_id]
    );
    return result.rows[0];
};

const updateFaculty = async (id, name, email, department_id) => {
    const result = await pool.query(
        'UPDATE faculties SET name = $1, email = $2, department_id = $3 WHERE faculty_id = $4 RETURNING *',
        [name, email, department_id, id]
    );
    return result.rows[0];
};

const deleteFaculty = async (id) => {
    const result = await pool.query(
        'DELETE FROM faculties WHERE faculty_id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

// Student
const getAllStudents = async () => {
    const result = await pool.query('SELECT * FROM students');
    return result.rows;
};

const createStudent = async (roll_number, name, email, department_id, current_year, section) => {
    const result = await pool.query(
        'INSERT INTO students (roll_number, name, email, department_id, current_year, section) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [roll_number, name, email, department_id, current_year, section]
    );
    return result.rows[0];
};

const updateStudent = async (id, roll_number, name, email, department_id, current_year, section) => {
    const result = await pool.query(
        'UPDATE students SET roll_number = $1, name = $2, email = $3, department_id = $4, current_year = $5, section = $6 WHERE student_id = $7 RETURNING *',
        [roll_number, name, email, department_id, current_year, section, id]
    );
    return result.rows[0];
};

const deleteStudent = async (id) => {
    const result = await pool.query(
        'DELETE FROM students WHERE student_id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

// Subject
const getAllSubjects = async () => {
    const result = await pool.query('SELECT * FROM subjects');
    return result.rows;
};

const createSubject = async (name, department_id, year, section, batch_name) => {
    const result = await pool.query(
        'INSERT INTO subjects (subject_name, department_id, year, section, batch_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, department_id, year, section, batch_name]
    );
    return result.rows[0];
};

const updateSubject = async (id, name, department_id, year, section, batch_name) => {
    const result = await pool.query(
        'UPDATE subjects SET subject_name = $1, department_id = $2, year = $3, section = $4, batch_name = $5 WHERE subject_id = $6 RETURNING *',
        [name, department_id, year, section, batch_name, id]
    );
    return result.rows[0];
};

const deleteSubject = async (id) => {
    const result = await pool.query(
        'DELETE FROM subjects WHERE subject_id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

module.exports = {
    findAdminByEmail,
    createAdmin,
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getAllFaculties,
    createFacultyByAdmin,
    updateFaculty,
    deleteFaculty,
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject
};
