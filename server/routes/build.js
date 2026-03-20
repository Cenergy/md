const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const verifyToken = require('../middleware/auth');
const { triggerBuildCheck, subscribeBuildTask, unsubscribeBuildTask, isFinalStatus } = require('../services/buildWorker');

async function canAccessProject(projectId, userId) {
    const project = await prisma.projects.findUnique({
        where: { id: projectId }
    });
    if (!project) {
        return false;
    }
    if (project.owner_id === userId) {
        return true;
    }
    const isCollaborator = await prisma.project_links.findFirst({
        where: { project_id: projectId, user_id: userId }
    });
    return Boolean(isCollaborator);
}

async function getTaskIfAuthorized(taskId, userId) {
    const task = await prisma.build_tasks.findUnique({
        where: { id: taskId }
    });
    if (!task) {
        return null;
    }
    const hasAccess = await canAccessProject(task.project_id, userId);
    if (!hasAccess) {
        return 'FORBIDDEN';
    }
    return task;
}

/**
 * Trigger a new build task
 * POST /api/build
 * Body: { projectId: string }
 */
router.post('/build', verifyToken, async (req, res) => {
    try {
        const { projectId } = req.body;
        
        const hasAccess = await canAccessProject(projectId, req.user.id);
        if (!hasAccess) {
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
router.get('/build/:taskId', verifyToken, async (req, res) => {
    try {
        const taskId = parseInt(req.params.taskId);
        const task = await getTaskIfAuthorized(taskId, req.user.id);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }
        if (task === 'FORBIDDEN') {
            return res.status(403).json({ success: false, error: '无权访问该任务' });
        }
        res.json({ success: true, task });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/build/:taskId/stream', verifyToken, async (req, res) => {
    try {
        const taskId = parseInt(req.params.taskId);
        const task = await getTaskIfAuthorized(taskId, req.user.id);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }
        if (task === 'FORBIDDEN') {
            return res.status(403).json({ success: false, error: '无权访问该任务' });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        const sendTask = (buildTask) => {
            res.write(`data: ${JSON.stringify({ success: true, task: buildTask })}\n\n`);
            if (typeof res.flush === 'function') {
                res.flush();
            }
        };

        sendTask(task);

        if (isFinalStatus(task.status)) {
            return res.end();
        }

        subscribeBuildTask(task.id, res);

        const keepAliveTimer = setInterval(() => {
            res.write(': keep-alive\n\n');
            if (typeof res.flush === 'function') {
                res.flush();
            }
        }, 25000);

        req.on('close', () => {
            clearInterval(keepAliveTimer);
            unsubscribeBuildTask(task.id, res);
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

module.exports = router;
