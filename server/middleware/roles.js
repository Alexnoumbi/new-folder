const User = require('../models/User');

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!req.user.role) {
            return res.status(403).json({ message: 'User role not defined' });
        }

        if (allowedRoles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
    };
};

// Check if user has admin role - temporarily allowing all access
const requireAdmin = async (req, res, next) => {
    // Temporarily allow all access
    next();
};

module.exports = {
    requireAdmin,
    checkRole
};
