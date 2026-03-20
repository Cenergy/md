const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const verifyToken = require('../middleware/auth');
const { triggerBuildCheck } = require('../services/buildWorker');

/**
 * Trigger a new build task
 * POST /api/build
 * Body: { projectId: string }
 */
router.post('/build', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.body;
        
        // 验证项目存在
        const project = await prisma.projects.findUnique({
            where: { id: projectId }
        });
        
        if (!project) {
            return res.status(404).json({ success: false, error: '项目不存在' });
        }
        
        // 检查是否是项目所有者或协作者
        const isOwner = project.owner_id === req.user.id;
        const isCollaborator = await prisma.project_links.findFirst({
            where: { project_id: projectId, user_id: req.user.id }
        });
        
        if (!isOwner && !isCollaborator) {
            return res.status(403).json({ success: false, error: '无权操作该项目' });
        }
        
        // Create a new task in PENDING state
        const task = await prisma.build_tasks.create({
            data: {
                project_id: projectId,
                status: 'PENDING'
            }
        });

        // Trigger the worker immediately so it doesn't wait for the next poll
        triggerBuildCheck();

        res.json({
            success: true,
            message: 'Build task queued successfully.',
            taskId: task.id
        });
        } catch (error) {
        console.error('Failed to queue build task:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

/**
 * Get build status
 * GET /api/build/:taskId
 */
router.get('/build/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await prisma.build_tasks.findUnique({
            where: { id: parseInt(taskId) }
        });

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        res.json({ success: true, task });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

module.exports = router;
