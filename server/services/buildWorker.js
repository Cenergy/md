const prisma = require('../utils/prisma');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');

let isProcessing = false;

/**
 * Build Worker
 * Polls the database for pending build tasks and executes them sequentially.
 * This runs inside the main process but ensures only one build runs at a time.
 */
async function startBuildWorker() {
    console.log('Build Worker started. Waiting for tasks...');
    
    // Poll every 5 seconds
    // setInterval(triggerBuildCheck, 5000);
    triggerBuildCheck()
}

/**
 * Manually trigger a check for pending tasks.
 * Can be called when a new task is pushed to the queue.
 */
async function triggerBuildCheck() {
    if (isProcessing) return;

    try {
        // Find the oldest PENDING task
        const task = await prisma.build_tasks.findFirst({
            where: { status: 'PENDING' },
            orderBy: { created_at: 'asc' }
        });

        if (task) {
            await processTask(task);
            // After finishing a task, check again immediately in case there are more
            triggerBuildCheck();
        }
    } catch (error) {
        console.error('Build Worker Error:', error);
    }
}

async function processTask(task) {
    isProcessing = true;
    console.log(`[Worker] Starting build task #${task.id} for project ${task.project_id || 'default'}`);

    try {
        // Update status to PROCESSING
        await prisma.build_tasks.update({
            where: { id: task.id },
            data: { status: 'PROCESSING' }
        });

        // Prepare environment variables
        const env = { ...process.env };
        if (task.project_id) {
            env.PROJECT_ID = task.project_id;
        }

        // Execute build command
        // Note: 'npm run build:docs' must be run from the project root
        const rootDir = path.resolve(__dirname, '../../');
        
        await new Promise((resolve, reject) => {
            const child = exec('npm run build:docs', { cwd: rootDir, env }, async (error, stdout, stderr) => {
                const output = `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
                
                if (error) {
                    await prisma.build_tasks.update({
                        where: { id: task.id },
                        data: { 
                            status: 'FAILED',
                            output: output + `\n\nError: ${error.message}`
                        }
                    });
                    console.error(`[Worker] Task #${task.id} FAILED.`);
                    resolve(); // Resolve anyway to continue processing next tasks
                } else {
                    await prisma.build_tasks.update({
                        where: { id: task.id },
                        data: { 
                            status: 'COMPLETED',
                            output: output
                        }
                    });
                    console.log(`[Worker] Task #${task.id} COMPLETED.`);
                    resolve();
                }
            });

            // Lower the priority of the build process to prevent CPU starvation of the API server
            if (child.pid) {
                try {
                    // 19 is the lowest priority (niceness)
                    os.setPriority(child.pid, 19);
                    console.log(`[Worker] Set build task process priority to LOW (PID: ${child.pid})`);
                } catch (err) {
                    console.warn(`[Worker] Failed to set process priority for PID ${child.pid}:`, err.message);
                }
            }
        });

    } catch (e) {
        console.error(`[Worker] Unexpected error processing task #${task.id}:`, e);
        // Try to mark as failed if possible
        try {
            await prisma.build_tasks.update({
                where: { id: task.id },
                data: { status: 'FAILED', output: `Unexpected Worker Error: ${e.message}` }
            });
        } catch (dbError) {
            // ignore
        }
    } finally {
        isProcessing = false;
    }
}

module.exports = { startBuildWorker, triggerBuildCheck };
