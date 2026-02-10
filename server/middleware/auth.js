const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || 'md-test-secret-key';

const verifyToken = (req, res, next) => {
    const token = req.headers['token'] || req.query.token || req.body.token;
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
