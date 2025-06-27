const { verifyToken } = require('../config/jwt');

const authMiddleware = (req, res, next) => {
    console.log('--- Executing authMiddleware (regular user) ---'); // DEBUG LOG
    console.log('Auth Header:', req.header('Authorization') ? 'Present' : 'Missing'); // DEBUG LOG
    // console.log('Auth Header Full Value:', req.header('Authorization')); // Optional DEBUG LOG

    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token format is incorrect' });
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid', error: error.message });
    }
};

module.exports = authMiddleware;