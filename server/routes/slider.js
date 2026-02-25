const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const verifyToken = require('../middleware/auth');
const { generateId } = require('../utils/common');
const { sliderSaveSchema } = require('../data/schemas');



router.get('/slider/all', verifyToken, async (req, res) => {
    const { projectId } = req.query;
    const menus = await prisma.menus.findMany({
        where: { project_id: projectId },
        orderBy: { sort_order: 'asc' }
    });
    
    const getSliders = async (menuLink, parentId = null) => {
        const where = {
            project_id: projectId,
            parent_id: parentId
        };
        if (parentId === null) {
            where.menu_link = menuLink;
        }

        const sliders = await prisma.sliders.findMany({
            where,
            orderBy: { sort_order: 'asc' }
        });

        for (const slider of sliders) {
            slider.isActive = false;
            if (slider.is_group) {
                slider.group = true; 
                slider.children = await getSliders(menuLink, slider.id);
            } else {
                slider.group = false;
            }
        }
        return sliders;
    };

    for (const menu of menus) {
        menu.sliders = await getSliders(menu.link);
    }
    
    res.json({ ok: true, data: menus });
});

router.get('/slider/list', verifyToken, async (req, res) => {
    const { projectId, link } = req.query; // link is menu_link
    
    if (!link) {
         const sliders = await prisma.sliders.findMany({
             where: { project_id: projectId },
             orderBy: { sort_order: 'asc' }
         });
         return res.json({ ok: true, data: sliders });
    }

    const sliders = await prisma.sliders.findMany({
        where: {
            project_id: projectId,
            menu_link: link,
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
            slider.children = [];
        }
    }
    
    res.json({ ok: true, data: sliders });
});


router.post('/slider/save', verifyToken, async (req, res) => {
    const validation = sliderSaveSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ ok: false, message: validation.error.issues[0].message });
    }
    const { projectId, link, data } = validation.data; // link is menu_link, data is array of sliders
    
    let order = 0;
    
    const processSlider = async (item, parentId = null) => {
        let slider = await prisma.sliders.findFirst({
            where: { project_id: projectId, link: item.link }
        });
        
        let id = slider ? slider.id : generateId();
        let content = slider ? slider.content : ''; 
        
        if (slider) {
            await prisma.sliders.update({
                where: { id: slider.id },
                data: {
                    name: item.name,
                    menu_link: link,
                    is_group: item.group,
                    parent_id: parentId,
                    sort_order: order++
                }
            });
        } else {
            await prisma.sliders.create({
                data: {
                    id,
                    project_id: projectId,
                    menu_link: link,
                    name: item.name,
                    link: item.link,
                    is_group: item.group,
                    parent_id: parentId,
                    sort_order: order++,
                    content: content
                }
            });
        }
        
        if (item.children && item.children.length > 0) {
            for (const child of item.children) {
                await processSlider(child, id);
            }
        }
    };

    for (const item of data) {
        await processSlider(item);
    }
    
    res.json({ ok: true });
});

router.get('/slider/item/list', verifyToken, async (req, res) => {
    const { projectId, item } = req.query; // item is the slider link
    const slider = await prisma.sliders.findFirst({
        where: { project_id: projectId, link: item }
    });
    res.json({ ok: true, data: slider ? slider.content : '' });
});

router.post('/slider/item/save', verifyToken, async (req, res) => {
    const { projectId, item, data } = req.body; // item is link, data is content
    const slider = await prisma.sliders.findFirst({
        where: { project_id: projectId, link: item }
    });
    
    if (slider) {
        await prisma.sliders.update({
            where: { id: slider.id },
            data: { content: data }
        });
        res.json({ ok: true });
    } else {
         res.json({ ok: false, message: 'Slider not found' });
    }
});

module.exports = router;
