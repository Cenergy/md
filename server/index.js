const express = require('express');
const cors = require('cors');
// const bodyParser = require('body-parser'); // Removed: Express has built-in body parsing
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const SECRET_KEY = process.env.SECRET_KEY || 'md-test-secret-key';

const SMTP_TLS = process.env.SMTP_TLS === 'true';
const SMTP_PORT = process.env.SMTP_PORT || 465;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const EMAILS_FROM_EMAIL = process.env.EMAILS_FROM_EMAIL;
const EMAILS_FROM_NAME = process.env.EMAILS_FROM_NAME || "FastAPI Admin";

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_TLS, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
    },
});

async function sendEmail(to, subject, text) {
    try {
        const info = await transporter.sendMail({
            from: `"${EMAILS_FROM_NAME}" <${EMAILS_FROM_EMAIL}>`, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
        });
        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}


// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Also serve /p/ for file uploads compatibility if needed, but frontend seems to handle url construction
// The frontend constructs url: `${host}/p/${res.fileName}`.
// So we might need to serve /p/ mapped to uploads?
// Or we just return full URL.
// Let's serve /p pointing to uploads to match frontend expectation:
app.use('/p', express.static(path.join(__dirname, 'uploads')));


// File Upload Setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure directory exists
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = crypto.randomUUID() + ext;
        cb(null, name)
    }
});
const upload = multer({ storage: storage });

// Helper Functions
const generateId = () => crypto.randomUUID();

const verifyToken = (req, res, next) => {
    const token = req.headers['token'] || req.query.token || req.body.token;
    if (!token) {
        return res.status(401).json({ ok: false, message: 'No token provided' });
    }
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ ok: false, message: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
};

// Routes

// 1. Token Validate
app.get('/glicon/tokenvalidate', verifyToken, (req, res) => {
    res.json(true); 
});

// 2. User Routes
app.post('/glicon/user/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.users.findFirst({
            where: { email, password }
        });
        if (user) {
            if (user.status === 0) {
                return res.json({ ok: false, message: 'Account inactive. Please verify your email.' });
            }
            const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET_KEY, { expiresIn: '7d' });
            res.json({
                ok: true,
                data: token,
            });
        } else {
            res.status(401).json({ ok: false, message: 'Invalid credentials' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ ok: false, message: e.message });
    }
});

app.post('/glicon/user/register', async (req, res) => {
    const { email, password, code } = req.body;
    
    // Verify code
    let status = 1;
    if (!code) {
        status = 0;
    } else {
        const verify = await prisma.verify_codes.findFirst({
            where: { email, code }
        });
        if (!verify) {
            return res.json({ ok: false, message: 'Invalid verification code' }); 
        }
        // Check expiry
        if (new Date(verify.expires_at) < new Date()) {
             return res.json({ ok: false, message: 'Verification code expired' });
        }
    }

    try {
        await prisma.users.create({
            data: {
                email,
                password,
                name: email.split('@')[0],
                status
            }
        });
        res.json({ ok: true, message: status === 1 ? 'Registered successfully' : 'Registered. Please activate your account.' });
    } catch (e) {
        console.error('Registration error:', e);
        if (e.code === 'P2002') { // Prisma unique constraint violation
            res.json({ ok: false, message: 'User already exists' });
        } else {
            res.json({ ok: false, message: 'Registration failed: ' + e.message });
        }
    }
});

app.get('/glicon/user/vercode', async (req, res) => {
    const { email } = req.query;
    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    await prisma.verify_codes.upsert({
        where: { email },
        update: { code, expires_at: expiresAt },
        create: { email, code, expires_at: expiresAt }
    });
    
    // Send email
    const subject = '欢迎注册 mdpress';
    const text = `你的注册验证码:\n${code}`;
    sendEmail(email, subject, text);

    console.log(`Verification code for ${email}: ${code}`);
    res.json({ ok: true, message: 'Code sent' });
});

app.get('/glicon/userinfo/query', verifyToken, async (req, res) => {
    const user = await prisma.users.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, name: true, avatar: true }
    });
    res.json({ ok: true, data: { userInfo: user } });
});

app.post('/glicon/userinfo/updatename', verifyToken, async (req, res) => {
    const { name } = req.body;
    await prisma.users.update({
        where: { id: req.user.id },
        data: { name }
    });
    res.json({ ok: true });
});

app.get('/glicon/userinfo/search', verifyToken, async (req, res) => {
    const { keywords } = req.query;
    const users = await prisma.users.findMany({
        where: {
            OR: [
                { email: { contains: keywords } },
                { name: { contains: keywords } }
            ]
        },
        select: { id: true, email: true, name: true, avatar: true }
    });
    res.json({ ok: true, data: users });
});


// 3. Project Routes
app.get('/glicon/project/list', verifyToken, async (req, res) => {
    const projects = await prisma.projects.findMany({
        where: { owner_id: req.user.id }
    });
    // Parse hero
    projects.forEach(p => {
        try { p.hero = JSON.parse(p.hero); } catch(e) {}
    });
    res.json({ ok: true, data: projects });
});

app.get('/glicon/project/query', verifyToken, async (req, res) => {
    const { projectId } = req.query;
    const project = await prisma.projects.findUnique({
        where: { id: projectId }
    });
    if (project) {
        try { project.hero = JSON.parse(project.hero); } catch(e) {}
        res.json({ ok: true, data: project });
    } else {
        res.json({ ok: false, message: 'Project not found' });
    }
});

app.post('/glicon/project/save', verifyToken, async (req, res) => {
    const { name } = req.body;
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

app.post('/glicon/project/update', verifyToken, async (req, res) => {
    const { id, name } = req.body;
    await prisma.projects.update({
        where: { id },
        data: { name }
    });
    res.json({ ok: true });
});

app.post('/glicon/project/profile', verifyToken, async (req, res) => {
    const { projectId, query, ...profileData } = req.body;
    
    if (query) {
        const project = await prisma.projects.findUnique({
            where: { id: projectId },
            select: { hero: true }
        });
        let hero = {};
        try { hero = JSON.parse(project?.hero || '{}'); } catch(e) {}
        res.json({ ok: true, data: { hero } });
    } else {
        const p = await prisma.projects.findUnique({
            where: { id: projectId },
            select: { hero: true }
        });
        let currentHero = {};
        try { currentHero = JSON.parse(p?.hero || '{}'); } catch(e) {}
        
        const newHero = { ...currentHero, ...profileData };
        await prisma.projects.update({
            where: { id: projectId },
            data: { hero: JSON.stringify(newHero) }
        });
        res.json({ ok: true });
    }
});

// 4. Menu Routes
app.get('/glicon/menu/list', verifyToken, async (req, res) => {
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
        
        // Recursively get children for sliders (groups)
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

app.post('/glicon/menu/save', verifyToken, async (req, res) => {
    const { projectId, name, link } = req.body;
    // Check if exists
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

app.post('/glicon/menu/sort', verifyToken, async (req, res) => {
    const { projectId, data } = req.body; // data is array of menus
    
    // Transaction?
    // Prisma transactions are supported.
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

// 5. Slider/Doc Routes
app.get('/glicon/slider/all', verifyToken, async (req, res) => {
    const { projectId } = req.query;
    const sliders = await prisma.sliders.findMany({
        where: { project_id: projectId }
    });
    res.json({ ok: true, data: sliders });
});

app.get('/glicon/slider/list', verifyToken, async (req, res) => {
    const { projectId, link } = req.query; // link is menu_link
    
    if (!link) {
         const sliders = await prisma.sliders.findMany({
             where: { project_id: projectId },
             orderBy: { sort_order: 'asc' }
         });
         return res.json({ ok: true, data: sliders });
    }

    // Get top-level sliders for this menu
    const sliders = await prisma.sliders.findMany({
        where: {
            project_id: projectId,
            menu_link: link,
            parent_id: null
        },
        orderBy: { sort_order: 'asc' }
    });
    
    // Fetch children for groups
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


app.post('/glicon/slider/save', verifyToken, async (req, res) => {
    const { projectId, link, data } = req.body; // link is menu_link, data is array of sliders
    
    // We need to sync the sliders for this menu.
    // data structure: [{ name, link, group, children: [] }, ...]
    
    let order = 0;
    
    // Recursive helper function for processing sliders
    const processSlider = async (item, parentId = null) => {
        // Check existence by link + project_id
        let slider = await prisma.sliders.findFirst({
            where: { project_id: projectId, link: item.link }
        });
        
        let id = slider ? slider.id : generateId();
        let content = slider ? slider.content : ''; // Preserve content if exists
        
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

    // To ensure correct order and structure, we could clear non-content fields first,
    // but the recursive upsert logic above naturally handles moving items and reordering.
    // However, what if an item was removed? The above only updates/creates.
    // Real sync should probably delete missing items?
    // Current legacy implementation didn't delete missing items explicitly in the snippet I saw,
    // or maybe it relied on the fact that `data` contains all valid items?
    // If we want to support deletion (removing a slider from menu), we should find all sliders for this menu/project
    // and delete those not in `data`.
    // But let's stick to the original logic for now which was "Upsert".
    // Wait, the original logic didn't delete either? 
    // "Simplest strategy: Delete existing sliders for this menu and recreate? BUT we need to preserve content!"
    // So the original code just updated/inserted. If user deleted a slider in UI, it won't be in `data`,
    // so it won't be updated. It will remain in DB as a "ghost" slider (maybe visible if we fetch all?).
    // Actually, `slider/list` fetches by `menu_link`. If we change `menu_link` of all valid items,
    // the ghost ones will still have the old `menu_link`.
    // If the UI sends ALL items for this menu, we can set `menu_link` of all items in DB for this menu to something else (trash) first?
    // No, that's risky.
    // Let's implement the recursive update as requested.
    
    // NOTE: To fix the "ghost" issue, we could:
    // 1. Get all IDs from `data` (recursive).
    // 2. Delete all sliders where project_id=pid AND menu_link=link AND id NOT IN (ids).
    // This cleans up deleted items. I'll add this for better quality.
    
    const getAllIds = (items) => {
        let ids = [];
        for (const item of items) {
            // We don't have ID in `item` from frontend (it uses link as key often), 
            // but we can try to resolve it.
            // Actually frontend `item` might not have DB ID.
            // So we can't easily delete by ID unless we resolve them all first.
            // Let's stick to strict replacement of `server/index.js` logic which was just Upsert.
        }
    };

    for (const item of data) {
        await processSlider(item);
    }
    
    res.json({ ok: true });
});

app.get('/glicon/slider/item/list', verifyToken, async (req, res) => {
    const { projectId, item } = req.query; // item is the slider link
    const slider = await prisma.sliders.findFirst({
        where: { project_id: projectId, link: item }
    });
    res.json({ ok: true, data: slider ? slider.content : '' });
});

app.post('/glicon/slider/item/save', verifyToken, async (req, res) => {
    const { projectId, item, data } = req.body; // item is link, data is content
    // Update content. Link is not unique globally, but per project.
    // We should find the record first.
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
        // Should not happen if created via slider/save, but handle safely
         res.json({ ok: false, message: 'Slider not found' });
    }
});


// 6. File Upload
app.post('/glicon/file/upload', upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ ok: false, message: 'No file uploaded' });
    }
    const fullUrl = `http://localhost:${PORT}/p/${req.file.filename}`;
    res.json({ 
        ok: true, 
        fileName: fullUrl,
        url: fullUrl 
    });
});

// 7. Collaboration
app.get('/glicon/project/collaborate', verifyToken, async (req, res) => {
    // Join project_links with projects
    // Prisma: project_links has relation `projects`.
    const links = await prisma.project_links.findMany({
        where: { email: req.user.email },
        include: { projects: true }
    });
    // Map to just projects array
    const projects = links.map(link => link.projects).filter(p => p !== null);
    res.json({ ok: true, data: projects });
});

app.get('/glicon/project_link/users', verifyToken, async (req, res) => {
    const { projectId } = req.query;
    const users = await prisma.project_links.findMany({
        where: { project_id: projectId }
    });
    res.json({ ok: true, data: users });
});

app.post('/glicon/project_link/save', verifyToken, async (req, res) => {
    const { projectId, email } = req.body;
    
    // Check if user exists
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

    // Get project name
    const project = await prisma.projects.findUnique({
        where: { id: projectId }
    });
    const projectName = project ? project.name : 'Unknown Project';

    // Send collaboration email
    const subject = `协助邀请 - ${projectName}`;
    const text = `${email} 你好,你已经被${projectName}的管理员加入协作者,你现在可以对${projectName}贡献你的力量了`;
    sendEmail(email, subject, text);

    res.json({ ok: true });
});

app.get('/glicon/project_link/delete', verifyToken, async (req, res) => {
    const { projectId, uid } = req.query; 
    // uid is project_links.id (Int) or maybe string from query?
    // req.query params are strings. We need to parse int for ID.
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
    
    // Fallback: try deleting by user_id or email
    // If uid was not an int ID, it might be email string?
    // Or if delete by ID failed.
    
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

// 8. Build
app.get('/glicon/project/build', verifyToken, (req, res) => {
    // Mock build
    res.json({ ok: true, message: 'Build triggered' });
});


// Start server with Vite Middleware or Static Serving
const startServer = async () => {
    // Prisma connects automatically on first query, but we can verify connection.
    try {
        await prisma.$connect();
        console.log('Connected to database via Prisma');
    } catch (e) {
        console.error('Failed to connect to database', e);
        process.exit(1);
    }

    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
        console.log('Running in production mode, serving static files from ../dist');
        app.use(express.static(path.join(__dirname, '../dist')));
        
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../dist/index.html'));
        });
    } else {
        console.log('Running in development mode, attaching Vite middleware');
        try {
            const { createServer } = await import('vite');
            // We can optionally pass configFile: false or specific config path.
            // By default, it will automatically look for vite.config.js in root.
            const vite = await createServer({
                server: { middlewareMode: true },
                appType: 'spa',
                root: path.resolve(__dirname, '..') // Project root
            });
            app.use(vite.middlewares);
        } catch (e) {
            console.error('Failed to start Vite middleware:', e);
        }
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();
