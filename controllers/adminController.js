const adminModel = require('../models/adminModel');
const { comparePassword, hashPassword } = require('../utils/passwordHasher');
const { generateToken } = require('../config/jwt');

// ----------- ADMIN AUTH -----------
const registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    try {
        const existingAdmin = await adminModel.findAdminByEmail(email);
        if (existingAdmin) {
            return res.status(409).json({ message: 'Admin with this email already exists.' });
        }
        const hashedPassword = await hashPassword(password);
        const newAdmin = await adminModel.createAdmin(name, email, hashedPassword);
        const token = generateToken({ id: newAdmin.admin_id, email: newAdmin.email, isAdmin: true });
        res.status(201).json({
            message: 'Admin registered successfully!',
            admin: {
                id: newAdmin.admin_id,
                name: newAdmin.name,
                email: newAdmin.email
            },
            token
        });
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const admin = await adminModel.findAdminByEmail(email);
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await comparePassword(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = generateToken({ id: admin.admin_id, email: admin.email, isAdmin: true });
        res.status(200).json({
            message: 'Logged in successfully!',
            admin: {
                id: admin.admin_id,
                name: admin.name,
                email: admin.email
            },
            token
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
};

// ----------- DEPARTMENTS -----------
const getDepartments = async (req, res) => {
    try {
        const departments = await adminModel.getAllDepartments();
        res.status(200).json(departments);
    } catch (error) {
        console.error('Error getting departments:', error);
        res.status(500).json({ message: 'Internal server error getting departments.' });
    }
};

const createDepartment = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Department name is required.' });
    }
    try {
        const newDepartment = await adminModel.createDepartment(name);
        res.status(201).json({ message: 'Department created successfully.', department: newDepartment });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ message: 'Internal server error creating department.' });
    }
};

const updateDepartment = async (req, res) => {
    const { department_id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Department name is required.' });
    }
    try {
        const updatedDepartment = await adminModel.updateDepartment(department_id, name);
        if (!updatedDepartment) {
            return res.status(404).json({ message: 'Department not found.' });
        }
        res.status(200).json({ message: 'Department updated successfully.', department: updatedDepartment });
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ message: 'Internal server error updating department.' });
    }
};

const deleteDepartment = async (req, res) => {
    const { department_id } = req.params;
    try {
        const deletedDepartment = await adminModel.deleteDepartment(department_id);
        if (!deletedDepartment) {
            return res.status(404).json({ message: 'Department not found.' });
        }
        res.status(200).json({ message: 'Department deleted successfully.' });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({ message: 'Internal server error deleting department.' });
    }
};

// ----------- FACULTY -----------
const getFaculties = async (req, res) => {
    try {
        const faculties = await adminModel.getAllFaculties();
        res.status(200).json(faculties);
    } catch (error) {
        console.error('Error getting faculties:', error);
        res.status(500).json({ message: 'Internal server error getting faculties.' });
    }
};

const createFaculty = async (req, res) => {
    const { name, email, password, department_id } = req.body;
    if (!name || !email || !password || !department_id) {
        return res.status(400).json({ message: 'All faculty fields are required.' });
    }
    try {
        const newFaculty = await adminModel.createFacultyByAdmin(name, email, password, department_id);
        res.status(201).json({ message: 'Faculty created successfully.', faculty: newFaculty });
    } catch (error) {
        console.error('Error creating faculty:', error);
        res.status(500).json({ message: 'Internal server error creating faculty.' });
    }
};

const updateFaculty = async (req, res) => {
    const { faculty_id } = req.params;
    const { name, email, department_id } = req.body;
    if (!name || !email || !department_id) {
        return res.status(400).json({ message: 'All faculty fields are required for update.' });
    }
    try {
        const updatedFaculty = await adminModel.updateFaculty(faculty_id, name, email, department_id);
        if (!updatedFaculty) {
            return res.status(404).json({ message: 'Faculty not found.' });
        }
        res.status(200).json({ message: 'Faculty updated successfully.', faculty: updatedFaculty });
    } catch (error) {
        console.error('Error updating faculty:', error);
        res.status(500).json({ message: 'Internal server error updating faculty.' });
    }
};

const deleteFaculty = async (req, res) => {
    const { faculty_id } = req.params;
    try {
        const deletedFaculty = await adminModel.deleteFaculty(faculty_id);
        if (!deletedFaculty) {
            return res.status(404).json({ message: 'Faculty not found.' });
        }
        res.status(200).json({ message: 'Faculty deleted successfully.' });
    } catch (error) {
        console.error('Error deleting faculty:', error);
        res.status(500).json({ message: 'Internal server error deleting faculty.' });
    }
};

// ----------- STUDENTS -----------
const getStudents = async (req, res) => {
    try {
        const students = await adminModel.getAllStudents();
        res.status(200).json(students);
    } catch (error) {
        console.error('Error getting students:', error);
        res.status(500).json({ message: 'Internal server error getting students.' });
    }
};

const createStudent = async (req, res) => {
    const { roll_number, name, email, department_id, current_year, section } = req.body;
    if (!roll_number || !name || !department_id || !current_year || !section) {
        return res.status(400).json({ message: 'All required student fields are missing.' });
    }
    try {
        const newStudent = await adminModel.createStudent(roll_number, name, email, department_id, current_year, section);
        res.status(201).json({ message: 'Student created successfully.', student: newStudent });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Internal server error creating student.' });
    }
};

const updateStudent = async (req, res) => {
    const { student_id } = req.params;
    const { roll_number, name, email, department_id, current_year, section } = req.body;
    if (!roll_number || !name || !department_id || !current_year || !section) {
        return res.status(400).json({ message: 'All required student fields are missing for update.' });
    }
    try {
        const updatedStudent = await adminModel.updateStudent(student_id, roll_number, name, email, department_id, current_year, section);
        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.status(200).json({ message: 'Student updated successfully.', student: updatedStudent });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Internal server error updating student.' });
    }
};

const deleteStudent = async (req, res) => {
    const { student_id } = req.params;
    try {
        const deletedStudent = await adminModel.deleteStudent(student_id);
        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.status(200).json({ message: 'Student deleted successfully.' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Internal server error deleting student.' });
    }
};

// ----------- SUBJECTS -----------
const getSubjects = async (req, res) => {
    try {
        const subjects = await adminModel.getAllSubjects();
        res.status(200).json(subjects);
    } catch (error) {
        console.error('Error getting subjects:', error);
        res.status(500).json({ message: 'Internal server error getting subjects.' });
    }
};

const createSubject = async (req, res) => {
    const { subject_name, department_id, year, section, batch_name } = req.body;
    if (!subject_name || !department_id || !year || !section) {
        return res.status(400).json({ message: 'Subject name, department, year, and section are required.' });
    }
    try {
        const newSubject = await adminModel.createSubject(subject_name, department_id, year, section, batch_name);
        res.status(201).json({ message: 'Subject created successfully.', subject: newSubject });
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({ message: 'Internal server error creating subject.' });
    }
};

const updateSubject = async (req, res) => {
    const { subject_id } = req.params;
    const { subject_name, department_id, year, section, batch_name } = req.body;
    if (!subject_name || !department_id || !year || !section) {
        return res.status(400).json({ message: 'Subject name, department, year, and section are required for update.' });
    }
    try {
        const updatedSubject = await adminModel.updateSubject(subject_id, subject_name, department_id, year, section, batch_name);
        if (!updatedSubject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }
        res.status(200).json({ message: 'Subject updated successfully.', subject: updatedSubject });
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({ message: 'Internal server error updating subject.' });
    }
};

const deleteSubject = async (req, res) => {
    const { subject_id } = req.params;
    try {
        const deletedSubject = await adminModel.deleteSubject(subject_id);
        if (!deletedSubject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }
        res.status(200).json({ message: 'Subject deleted successfully.' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ message: 'Internal server error deleting subject.' });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject
};
