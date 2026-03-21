const jwt = require('jsonwebtoken');
const config = require('../config');

const SECRET_KEY = config.jwtSecret;

/**
 * Extract token from request
 * Supports both standard Authorization: Bearer <token> and legacy token header
 */
const extractToken = (req) => {
    // 1. Standard Authorization: Bearer <token> (preferred)
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    
    // 2. Legacy token header (backward compatibility)
    if (req.headers['token']) {
        return req.headers['token'];
    }
    
    // 3. Query parameter
    if (req.query.token) {
        return req.query.token;
    }
    
    // 4. Request body
    if (req.body && req.body.token) {
        return req.body.token;
    }
    
    return null;
};

const verifyToken = (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ ok: false, message: 'No token provided' });
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ ok: false, message: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;
