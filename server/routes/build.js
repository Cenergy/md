const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { triggerBuildCheck } = require('../services/buildWorker');

/**
 * Trigger a new build task
 * POST /api/build
 * Body: { projectId: string }
 */
router.post('/build', async (req, res) => {
    try {
        const { projectId } = req.body;
        
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
