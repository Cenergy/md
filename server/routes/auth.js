const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { sendEmail } = require('../utils/email');
const verifyToken = require('../middleware/auth');
const { loginSchema, registerSchema } = require('../data/schemas');
const config = require('../config');

const SECRET_KEY = config.jwtSecret;

// Token Validate
router.get('/tokenvalidate', verifyToken, (req, res) => {
    res.json(true); 
});

// Login
router.post('/user/login', async (req, res) => {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ ok: false, message: validation.error.issues[0].message });
    }
    
    const { email, password } = validation.data;

    try {
        const user = await prisma.users.findUnique({
            where: { email }
        });
        
        if (user) {
            if (user.status === 0) {
                return res.json({ ok: false, message: 'Account inactive. Please verify your email.' });
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return res.status(401).json({ ok: false, message: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET_KEY, { expiresIn: '7d' });
            res.json({
                ok: true,
                data: token,
            });
        } else {
            res.status(401).json({ ok: false, message: 'Invalid credentials' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ ok: false, message: e.message });
    }
});

// Register
router.post('/user/register', async (req, res) => {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ ok: false, message: validation.error.issues[0].message });
    }

    const { email, password, code } = validation.data;
    
    // Verify code
    let status = 1;
    if (!code) {
        status = 0;
    } else {
        const verify = await prisma.verify_codes.findFirst({
            where: { email, code }
        });
        if (!verify) {
            return res.json({ ok: false, message: 'Invalid verification code' }); 
        }
        // Check expiry
        if (new Date(verify.expires_at) < new Date()) {
             return res.json({ ok: false, message: 'Verification code expired' });
        }
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.users.create({
            data: {
                email,
                password: hashedPassword,
                name: email.split('@')[0],
                status
            }
        });
        res.json({ ok: true, message: status === 1 ? 'Registered successfully' : 'Registered. Please activate your account.' });
    } catch (e) {
        console.error('Registration error:', e);
        if (e.code === 'P2002') { // Prisma unique constraint violation
            res.json({ ok: false, message: 'User already exists' });
        } else {
            res.json({ ok: false, message: 'Registration failed: ' + e.message });
        }
    }
});

// Send Verification Code
router.get('/user/vercode', async (req, res) => {
    const { email } = req.query;
    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    await prisma.verify_codes.upsert({
        where: { email },
        update: { code, expires_at: expiresAt },
        create: { email, code, expires_at: expiresAt }
    });
    
    // Send email
    const subject = '欢迎注册 mdpress';
    const text = `你的注册验证码:\n${code}`;
    sendEmail(email, subject, text);

    console.log(`Verification code for ${email}: ${code}`);
    res.json({ ok: true, message: 'Code sent' });
});

module.exports = router;
