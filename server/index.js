require('express-async-errors'); // Must be at the top
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const prisma = require('./utils/prisma');
const setupFrontend = require('./middleware/frontend');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const config = require('./config');

const app = express();
const PORT = config.port;

// Middleware
// Content Security Policy Configuration
const cspDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Vite HMR and Monaco Editor
        "'unsafe-eval'",   // Required for Monaco Editor
        "blob:",           // Required for Monaco Editor web workers
    ],
    styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Vue/VitePress dynamic styles
        "https://fonts.googleapis.com",
    ],
    fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://at.alicdn.com", // Required for iconfont CDN
        "data:", // Required for icon fonts
    ],
    imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:", // Allow external images
    ],
    connectSrc: [
        "'self'",
        "https:", // Allow API connections
        "blob:",
    ],
    workerSrc: [
        "'self'",
        "blob:", // Required for Monaco Editor web workers
    ],
    frameSrc: ["'self'"],
    objectSrc: ["'none'"],
};

app.use(helmet({
    contentSecurityPolicy: {
        directives: cspDirectives,
    },
    crossOriginEmbedderPolicy: false // Required for Monaco Editor
}));
app.use(cors());
app.use(compression()); // Compress all routes
app.use(morgan('dev', {
    // Skip logging for non-API requests (frontend assets) to reduce noise
    // But always log errors (status >= 400)
    skip: (req, res) => res.statusCode < 400 && !req.originalUrl.startsWith('/api')
})); // Logger

// Rate Limiting (Prevent Brute Force)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { ok: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter); // Apply to API only

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static Files
const uploadDir = path.join(__dirname, config.upload.dir || 'uploads');
const docsDir = path.join(__dirname, '../docs/vitepress');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));
app.use('/p', express.static(docsDir)); // Serve docs
app.use('/p', express.static(uploadDir)); // Legacy images fallback

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const projectRoutes = require('./routes/project');
const menuRoutes = require('./routes/menu');
const sliderRoutes = require('./routes/slider');
const fileRoutes = require('./routes/file');
const buildRoutes = require('./routes/build');
const { startBuildWorker } = require('./services/buildWorker');

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', projectRoutes);
app.use('/api', menuRoutes);
app.use('/api', sliderRoutes);
app.use('/api', fileRoutes);
app.use('/api', buildRoutes);

// API 404 Handler (must be after all API routes)
app.use('/api/*', notFoundHandler);

// Start Background Worker
startBuildWorker();

// Setup Frontend (Static/Vite)
setupFrontend(app).then(() => {
    // Global Error Handler (must be very last)
    app.use(errorHandler);

    const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });

    // Graceful Shutdown
    const shutdown = async () => {
        console.log('Shutting down server...');
        await prisma.$disconnect();
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
});
