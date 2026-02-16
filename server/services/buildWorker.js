const prisma = require('../utils/prisma');
const { spawn } = require('child_process');
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
            // Use spawn instead of exec to avoid buffer limits and allow streaming
            const child = spawn('npm', ['run', 'build:docs'], { 
                cwd: rootDir, 
                env,
                shell: true // Ensure npm is found and runs correctly
            });

            let stdoutChunks = [];
            let stderrChunks = [];

            child.stdout.on('data', (data) => {
                stdoutChunks.push(data);
            });

            child.stderr.on('data', (data) => {
                stderrChunks.push(data);
            });

            child.on('error', (error) => {
                reject(error);
            });

            child.on('close', async (code) => {
                const stdout = Buffer.concat(stdoutChunks).toString();
                const stderr = Buffer.concat(stderrChunks).toString();
                
                // Truncate output for DB storage if necessary, though spawn handles large memory better
                const MAX_LOG_LENGTH = 50000;
                const truncatedStdout = stdout.length > MAX_LOG_LENGTH ? '...' + stdout.slice(-MAX_LOG_LENGTH) : stdout;
                const truncatedStderr = stderr.length > MAX_LOG_LENGTH ? '...' + stderr.slice(-MAX_LOG_LENGTH) : stderr;
                const output = `STDOUT:\n${truncatedStdout}\n\nSTDERR:\n${truncatedStderr}`;

                try {
                    if (code !== 0) {
                        await prisma.build_tasks.update({
                            where: { id: task.id },
                            data: { 
                                status: 'FAILED',
                                output: output + `\n\nExit Code: ${code}`
                            }
                        });
                        console.error(`[Worker] Task #${task.id} FAILED (Exit Code: ${code}).`);
                    } else {
                        await prisma.build_tasks.update({
                            where: { id: task.id },
                            data: { 
                                status: 'COMPLETED',
                                output: output
                            }
                        });
                        console.log(`[Worker] Task #${task.id} COMPLETED.`);
                    }
                } catch (dbError) {
                    console.error(`[Worker] Error updating task status:`, dbError);
                } finally {
                    resolve();
                }
            });

            // Lower the priority of the build process
            if (child.pid) {
                try {
                    os.setPriority(child.pid, 19);
                    console.log(`[Worker] Set build task process priority to LOW (PID: ${child.pid})`);
                } catch (err) {
                    // Ignore priority setting errors
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
