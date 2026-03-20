const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const verifyToken = require('../middleware/auth');
const { generateId, safeJSONParse } = require('../utils/common');
const { sendEmail } = require('../utils/email');
const { projectCreateSchema, projectUpdateSchema, projectProfileSchema, projectLinkSchema } = require('../data/schemas');

// Project Routes
router.get('/project/list', verifyToken, async (req, res) => {
    const projects = await prisma.projects.findMany({
        where: { owner_id: req.user.id }
    });
    // Parse hero
    projects.forEach(p => {
        p.hero = safeJSONParse(p.hero);
    });
    res.json({ ok: true, data: projects });
});

router.get('/project/query', verifyToken, async (req, res) => {
    const { projectId } = req.query;
    const project = await prisma.projects.findUnique({
        where: { id: projectId }
    });
    if (project) {
        project.hero = safeJSONParse(project.hero);
        res.json({ ok: true, data: project });
    } else {
        res.json({ ok: false, message: 'Project not found' });
    }
});

router.post('/project/save', verifyToken, async (req, res) => {
    const validation = projectCreateSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ ok: false, message: validation.error.issues[0].message });
    }
    const { name } = validation.data;
    const id = generateId();
    await prisma.projects.create({
        data: {
            id,
            name,
            owner_id: req.user.id,
            hero: '{}'
        }
    });
    res.json({ ok: true, data: { id, name } });
});

router.post('/project/update', verifyToken, async (req, res) => {
    const validation = projectUpdateSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ ok: false, message: validation.error.issues[0].message });
    }
    const { id, name } = validation.data;
    await prisma.projects.update({
        where: { id },
        data: { name }
    });
    res.json({ ok: true });
});

router.post('/project/profile', verifyToken, async (req, res) => {
    const validation = projectProfileSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ ok: false, message: validation.error.issues[0].message });
    }
    const { projectId, query, ...profileData } = validation.data;
    
    if (query) {
        const project = await prisma.projects.findUnique({
            where: { id: projectId },
            select: { hero: true }
        });
        const hero = safeJSONParse(project?.hero);
        res.json({ ok: true, data: { hero } });
    } else {
        const p = await prisma.projects.findUnique({
            where: { id: projectId },
            select: { hero: true }
        });
        const currentHero = safeJSONParse(p?.hero);
        
        const newHero = { ...currentHero, ...profileData };
        await prisma.projects.update({
            where: { id: projectId },
            data: { hero: JSON.stringify(newHero) }
        });
        res.json({ ok: true });
    }
});

router.post('/project/delete', verifyToken, async (req, res) => {
    const { projectId } = req.body;
    
    // Check if project exists and user is owner
    const project = await prisma.projects.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        return res.status(404).json({ ok: false, message: 'Project not found' });
    }

    if (project.owner_id !== req.user.id) {
        return res.status(403).json({ ok: false, message: 'No permission to delete this project' });
    }

    // Delete all related data in transaction
    await prisma.$transaction([
        prisma.menus.deleteMany({ where: { project_id: projectId } }),
        prisma.sliders.deleteMany({ where: { project_id: projectId } }),
        prisma.project_links.deleteMany({ where: { project_id: projectId } }),
        prisma.build_tasks.deleteMany({ where: { project_id: projectId } }),
        prisma.projects.delete({ where: { id: projectId } })
    ]);

    res.json({ ok: true });
});

// Collaboration
router.get('/project/collaborate', verifyToken, async (req, res) => {
    const links = await prisma.project_links.findMany({
        where: { email: req.user.email },
        include: { projects: true }
    });
    const projects = links.map(link => link.projects).filter(p => p !== null);
    res.json({ ok: true, data: projects });
});

router.get('/project_link/users', verifyToken, async (req, res) => {
    const { projectId } = req.query;
    const users = await prisma.project_links.findMany({
        where: { project_id: projectId }
    });
    res.json({ ok: true, data: users });
});

router.post('/project_link/save', verifyToken, async (req, res) => {
    const validation = projectLinkSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ ok: false, message: validation.error.issues[0].message });
    }
    const { projectId, email } = validation.data;
    
    const user = await prisma.users.findFirst({
        where: { email }
    });
    const userId = user ? user.id : null;
    
    await prisma.project_links.create({
        data: {
            project_id: projectId,
            user_id: userId,
            email
        }
    });

    const project = await prisma.projects.findUnique({
        where: { id: projectId }
    });
    const projectName = project ? project.name : 'Unknown Project';

    const subject = `协助邀请 - ${projectName}`;
    const text = `${email} 你好,你已经被${projectName}的管理员加入协作者,你现在可以对${projectName}贡献你的力量了`;
    sendEmail(email, subject, text);

    res.json({ ok: true });
});

router.get('/project_link/delete', verifyToken, async (req, res) => {
    const { projectId, uid } = req.query; 
    const id = parseInt(uid);
    
    if (!isNaN(id)) {
        const result = await prisma.project_links.deleteMany({
            where: {
                id: id,
                project_id: projectId
            }
        });
        
        if (result.count > 0) {
            return res.json({ ok: true });
        }
    }
    
    await prisma.project_links.deleteMany({
        where: {
            project_id: projectId,
            OR: [
                { user_id: isNaN(id) ? undefined : id },
                { email: uid }
            ]
        }
    });

    res.json({ ok: true });
});

// Build - 已弃用，请使用 POST /api/build 异步构建
router.get('/project/build', verifyToken, async (_req, res) => {
    res.status(410).json({ 
        ok: false, 
        message: '此接口已弃用，请使用 POST /api/build 异步构建' 
    });
});

module.exports = router;
