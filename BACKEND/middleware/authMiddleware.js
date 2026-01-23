const jwt = require('jsonwebtoken');
const { pool } = require('../model/connect');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user information from database
        const userResult = await pool.query(
            'SELECT id, email, role, name, id_number FROM Users WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token - user not found'
            });
        }

        // Attach user info to request object
        // req.user = {
        //     userId: userResult.rows[0].id,
        //     email: userResult.rows[0].email,
        //     role: userResult.rows[0].role,
        //     name: userResult.rows[0].name,
        //     idNumber: userResult.rows[0].id_number
        // };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        } else {
            console.logAuthentication error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during authentication'
            });
        }
    }
};

// Middleware to check user role
// const requireRole = (requiredRole) => {
//     return (req, res, next) => {
//         if (!req.user || req.user.role !== requiredRole) {
//             return res.status(403).json({
//                 success: false,
//                 message: `Access denied. ${requiredRole} role required.`
//             });
//         }
//         next();
//     };
// };

// Middleware to allow multiple roles
// const requireAnyRole = (roles) => {
//     return (req, res, next) => {
//         if (!req.user || !roles.includes(req.user.role)) {
//             return res.status(403).json({
//                 success: false,
//                 message: `Access denied. One of these roles required: ${roles.join(', ')}`
//             });
//         }
//         next();
//     };
// };

// Middleware to validate request body
const validateRequestBody = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        
        next();
    };
};

// Middleware to validate request parameters
const validateRequestParams = (requiredParams) => {
    return (req, res, next) => {
        const missingParams = requiredParams.filter(param => !req.params[param]);
        
        if (missingParams.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required parameters: ${missingParams.join(', ')}`
            });
        }
        
        next();
    };
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.log('Error:', err.message);
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            details: err.message
        });
    }
    
    if (err.code === '23505') { // PostgreSQL unique violation
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry detected'
        });
    }
    
    if (err.code === '23503') { // PostgreSQL foreign key violation
        return res.status(400).json({
            success: false,
            message: 'Invalid reference detected'
        });
    }
    
    // Default error response
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const { method, url, ip } = req;
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);
    
    next();
};

module.exports = {
    authenticateToken,
    // requireRole,
    // requireAnyRole,
    validateRequestBody,
    validateRequestParams,
    errorHandler,
    requestLogger
};
