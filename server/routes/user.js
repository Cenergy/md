const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const verifyToken = require('../middleware/auth');
const { userUpdateSchema } = require('../data/schemas');

router.get('/userinfo/query', verifyToken, async (req, res) => {
    const user = await prisma.users.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, name: true, avatar: true }
    });
    res.json({ ok: true, data: { userInfo: user } });
});

router.post('/userinfo/updatename', verifyToken, async (req, res) => {
    const validation = userUpdateSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ ok: false, message: validation.error.issues[0].message });
    }

    const { name } = validation.data;
    await prisma.users.update({
        where: { id: req.user.id },
        data: { name }
    });
    res.json({ ok: true });
});

router.get('/userinfo/search', verifyToken, async (req, res) => {
    const { keywords } = req.query;
    const users = await prisma.users.findMany({
        where: {
            OR: [
                { email: { contains: keywords } },
                { name: { contains: keywords } }
            ]
        },
        select: { id: true, email: true, name: true, avatar: true }
    });
    res.json({ ok: true, data: users });
});

module.exports = router;
