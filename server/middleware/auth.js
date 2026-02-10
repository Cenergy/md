const jwt = require('jsonwebtoken');
const config = require('../config');

const SECRET_KEY = config.jwtSecret;

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
