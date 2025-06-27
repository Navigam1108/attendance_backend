// backend/utils/passwordHasher.js
const bcrypt = require('bcryptjs');

const saltRounds = 10;

const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Could not hash password');
    }
};

const comparePassword = async (plainPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.error('Error comparing password:', error);
        throw new Error('Could not compare password');
    }
};

// Make sure these functions are EXPORTED correctly
module.exports = {
    hashPassword,
    comparePassword
};