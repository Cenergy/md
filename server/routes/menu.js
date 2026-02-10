const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const verifyToken = require('../middleware/auth');
const { generateId } = require('../utils/common');
const { menuSaveSchema, menuSortSchema } = require('../data/schemas');

router.get('/menu/list', verifyToken, async (req, res) => {
    const { projectId } = req.query;
    const menus = await prisma.menus.findMany({
        where: { project_id: projectId },
        orderBy: { sort_order: 'asc' }
    });
    
    for (const menu of menus) {
        const sliders = await prisma.sliders.findMany({
            where: {
                project_id: projectId,
                menu_link: menu.link,
                parent_id: null
            },
            orderBy: { sort_order: 'asc' }
        });
        
        for (const slider of sliders) {
            if (slider.is_group) {
                slider.children = await prisma.sliders.findMany({
                    where: {
                        project_id: projectId,
                        parent_id: slider.id
                    },
                    orderBy: { sort_order: 'asc' }
                });
                slider.group = true; 
            } else {
                slider.group = false;
            }
        }
        menu.sliders = sliders;
    }
    
    res.json({ ok: true, data: menus });
});

router.post('/menu/save', verifyToken, async (req, res) => {
    const validation = menuSaveSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ ok: false, message: validation.error.issues[0].message });
    }
    const { projectId, name, link } = validation.data;
    const exists = await prisma.menus.findFirst({
        where: { project_id: projectId, link }
    });

    if (exists) {
        await prisma.menus.update({
            where: { id: exists.id },
            data: { name }
        });
    } else {
        const id = generateId();
        await prisma.menus.create({
            data: {
                id,
                project_id: projectId,
                name,
                link,
                sort_order: 0
            }
        });
    }
    res.json({ ok: true });
});

router.post('/menu/sort', verifyToken, async (req, res) => {
    const validation = menuSortSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ ok: false, message: validation.error.issues[0].message });
    }
    const { projectId, data } = validation.data; 
    
    await prisma.$transaction(
        data.map((item, index) => 
            prisma.menus.updateMany({
                where: { project_id: projectId, link: item.link },
                data: { sort_order: index }
            })
        )
    );
    res.json({ ok: true });
});

module.exports = router;
