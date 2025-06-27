const express = require('express');
const {
    registerAdmin, loginAdmin,
    getDepartments, createDepartment, updateDepartment, deleteDepartment,
    getFaculties, createFaculty, updateFaculty, deleteFaculty,
    getStudents, createStudent, updateStudent, deleteStudent,
    getSubjects, createSubject, updateSubject, deleteSubject
} = require('../controllers/adminController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

const router = express.Router();

router.post('/auth/register', registerAdmin);
router.post('/auth/login', loginAdmin);

router.get('/departments', adminAuthMiddleware, getDepartments);
router.post('/departments', adminAuthMiddleware, createDepartment);
router.put('/departments/:department_id', adminAuthMiddleware, updateDepartment);
router.delete('/departments/:department_id', adminAuthMiddleware, deleteDepartment);

router.get('/faculties', adminAuthMiddleware, getFaculties);
router.post('/faculties', adminAuthMiddleware, createFaculty);
router.put('/faculties/:faculty_id', adminAuthMiddleware, updateFaculty);
router.delete('/faculties/:faculty_id', adminAuthMiddleware, deleteFaculty);

router.get('/students', adminAuthMiddleware, getStudents);
router.post('/students', adminAuthMiddleware, createStudent);
router.put('/students/:student_id', adminAuthMiddleware, updateStudent);
router.delete('/students/:student_id', adminAuthMiddleware, deleteStudent);

router.get('/subjects', adminAuthMiddleware, getSubjects);
router.post('/subjects', adminAuthMiddleware, createSubject);
router.put('/subjects/:subject_id', adminAuthMiddleware, updateSubject);
router.delete('/subjects/:subject_id', adminAuthMiddleware, deleteSubject);

module.exports = router;