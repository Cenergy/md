const path = require("path");
const express = require("express");
const config = require("../config");

/**
 * Configure frontend serving middleware
 * Handles both Development (Vite Middleware) and Production (Static Files) modes
 * @param {import('express').Application} app
 */
async function setupFrontend(app) {
    if (config.isProduction) {
        console.log('Running in production mode, serving static files from ../dist');
        // Resolve path relative to project root (server/middleware/../../dist)
        const distPath = path.join(__dirname, '../../dist');
        
        app.use(express.static(distPath));
        
        // Handle SPA routing - return index.html for all non-API routes
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    } else {
        console.log('Running in development mode, attaching Vite middleware');
        try {
            const { createServer } = await import('vite');
            // By default, it will automatically look for vite.config.js in root.
            const vite = await createServer({
                server: { middlewareMode: true },
                appType: 'spa',
                root: path.resolve(__dirname, '../..') // Project root
            });
            app.use(vite.middlewares);
        } catch (e) {
            console.error('Failed to start Vite middleware:', e);
        }
    }
}

module.exports = setupFrontend;
