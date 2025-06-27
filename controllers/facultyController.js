// Handles faculty profile management.
const userModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/passwordHasher');

// Gets the profile of the authenticated faculty.
const getMyProfile = async (req, res) => {
    const facultyId = req.user.id; // From authMiddleware
    try {
        const faculty = await userModel.findFacultyById(facultyId);
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty profile not found.' });
        }
        res.status(200).json(faculty);
    } catch (error) {
        console.error('Error getting faculty profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Updates the profile of the authenticated faculty.
const updateMyProfile = async (req, res) => {
    const facultyId = req.user.id;
    const updates = req.body;
    try {
        const updatedFaculty = await userModel.updateFacultyProfile(facultyId, updates);
        if (!updatedFaculty) {
            return res.status(400).json({ message: 'No valid fields provided for update or profile not found.' });
        }
        res.status(200).json({
            message: 'Profile updated successfully!',
            faculty: updatedFaculty
        });
    } catch (error) {
        console.error('Error updating faculty profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Changes the password of the authenticated faculty.
const changeMyPassword = async (req, res) => {
    const facultyId = req.user.id;
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
        return res.status(400).json({ message: 'Current and new passwords are required.' });
    }
    try {
        const faculty = await userModel.findFacultyById(facultyId);
        if (!faculty) { // Should not happen if authMiddleware works
            return res.status(404).json({ message: 'Faculty not found.' });
        }
        const isMatch = await comparePassword(current_password, faculty.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password incorrect.' });
        }
        const newHashedPassword = await hashPassword(new_password);
        await userModel.updateFacultyPassword(facultyId, newHashedPassword);
        res.status(200).json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    changeMyPassword
};