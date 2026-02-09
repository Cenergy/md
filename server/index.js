const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { initDB, getDB } = require('./db');

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
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
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
        cb(null, 'uploads/')
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
    res.json(true); // Frontend expects boolean or {ok: true} ? 
    // Code: return response; (axios returns data).
    // http.js: return response; 
    // If backend returns true, response.data is true.
    // If backend returns {ok: true}, response.data is {ok: true}.
    // The usage in Editor.vue: .then(res => { this.isLogin = res; })
    // So it expects a boolean? Or an object?
    // http.js line 53: return response;
    // Let's assume it returns boolean true/false.
});

// 2. User Routes
app.post('/glicon/user/login', async (req, res) => {
    const { email, password } = req.body;
    const db = getDB();
    const user = await db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (user) {
        if (user.status === 0) {
            return res.json({ ok: false, message: 'Account inactive. Please verify your email.' });
        }
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET_KEY, { expiresIn: '7d' });
        // Update token in user table? Not strictly needed for JWT but maybe for tracking.
        res.json({
            ok: true,
            data: {
                token,
                userInfo: user
            }
        });
    } else {
        res.status(401).json({ ok: false, message: 'Invalid credentials' });
    }
});

app.post('/glicon/user/register', async (req, res) => {
    const { email, password, code } = req.body;
    const db = getDB();
    
    // Verify code
    // If code is empty, we allow registration but set status to 0 (inactive)
    let status = 1;
    if (!code) {
        status = 0;
    } else {
        const verify = await db.get('SELECT * FROM verify_codes WHERE email = ? AND code = ?', [email, code]);
        if (!verify) {
            return res.json({ ok: false, message: 'Invalid verification code' }); 
        }
        // Check expiry?
        if (new Date(verify.expires_at) < new Date()) {
             return res.json({ ok: false, message: 'Verification code expired' });
        }
    }

    try {
        const result = await db.run('INSERT INTO users (email, password, name, status) VALUES (?, ?, ?, ?)', [email, password, email.split('@')[0], status]);
        res.json({ ok: true, message: status === 1 ? 'Registered successfully' : 'Registered. Please activate your account.' });
    } catch (e) {
        console.error('Registration error:', e);
        if (e.message.includes('UNIQUE constraint failed')) {
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
    const db = getDB();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    await db.run('INSERT OR REPLACE INTO verify_codes (email, code, expires_at) VALUES (?, ?, ?)', [email, code, expiresAt]);
    
    // Send email
    const subject = '欢迎注册 mdpress';
    const text = `你的注册验证码:\n${code}`;
    sendEmail(email, subject, text);

    console.log(`Verification code for ${email}: ${code}`);
    res.json({ ok: true, message: 'Code sent' });
});

app.get('/glicon/userinfo/query', verifyToken, async (req, res) => {
    const db = getDB();
    const user = await db.get('SELECT id, email, name, avatar FROM users WHERE id = ?', [req.user.id]);
    res.json({ ok: true, data: { userInfo: user } });
});

app.post('/glicon/userinfo/updatename', verifyToken, async (req, res) => {
    const { name } = req.body;
    const db = getDB();
    await db.run('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
    res.json({ ok: true });
});

app.get('/glicon/userinfo/search', verifyToken, async (req, res) => {
    const { keywords } = req.query;
    const db = getDB();
    const users = await db.all('SELECT id, email, name, avatar FROM users WHERE email LIKE ? OR name LIKE ?', [`%${keywords}%`, `%${keywords}%`]);
    res.json({ ok: true, data: users });
});


// 3. Project Routes
app.get('/glicon/project/list', verifyToken, async (req, res) => {
    const db = getDB();
    const projects = await db.all('SELECT * FROM projects WHERE owner_id = ?', [req.user.id]);
    // Parse hero
    projects.forEach(p => {
        try { p.hero = JSON.parse(p.hero); } catch(e) {}
    });
    res.json({ ok: true, data: projects });
});

app.get('/glicon/project/query', verifyToken, async (req, res) => {
    const { projectId } = req.query;
    const db = getDB();
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [projectId]);
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
    const db = getDB();
    await db.run('INSERT INTO projects (id, name, owner_id, hero) VALUES (?, ?, ?, ?)', [id, name, req.user.id, '{}']);
    res.json({ ok: true, data: { id, name } });
});

app.post('/glicon/project/update', verifyToken, async (req, res) => {
    const { id, name } = req.body;
    const db = getDB();
    await db.run('UPDATE projects SET name = ? WHERE id = ?', [name, id]);
    res.json({ ok: true });
});

app.post('/glicon/project/profile', verifyToken, async (req, res) => {
    const { projectId, query, ...profileData } = req.body;
    const db = getDB();
    
    if (query) {
        const project = await db.get('SELECT hero FROM projects WHERE id = ?', [projectId]);
        let hero = {};
        try { hero = JSON.parse(project.hero); } catch(e) {}
        res.json({ ok: true, data: { hero } });
    } else {
        // Save profile (hero data mostly)
        // profileData might contain hero object directly or be part of it?
        // http.js: saveProjectProfile({ projectId, profileData, token }) -> body: { projectId, ...profileData }
        // Assuming profileData IS the hero object or contains it?
        // Let's assume the body contains keys that should be in hero.
        // Or specific fields? The mock data shows "hero".
        // Let's update the hero column with the whole body (minus projectId/token).
        
        // First get existing hero
        const p = await db.get('SELECT hero FROM projects WHERE id = ?', [projectId]);
        let currentHero = {};
        try { currentHero = JSON.parse(p.hero); } catch(e) {}
        
        const newHero = { ...currentHero, ...profileData };
        await db.run('UPDATE projects SET hero = ? WHERE id = ?', [JSON.stringify(newHero), projectId]);
        res.json({ ok: true });
    }
});

// 4. Menu Routes
app.get('/glicon/menu/list', verifyToken, async (req, res) => {
    const { projectId } = req.query;
    const db = getDB();
    const menus = await db.all('SELECT * FROM menus WHERE project_id = ? ORDER BY sort_order ASC', [projectId]);
    
    // For each menu, fetch sliders?
    // http.js queryMenu response example shows "sliders" array inside each menu.
    // So we need to join or fetch sliders.
    
    for (const menu of menus) {
        const sliders = await db.all('SELECT * FROM sliders WHERE project_id = ? AND menu_link = ? AND parent_id IS NULL ORDER BY sort_order ASC', [projectId, menu.link]);
        
        // Recursively get children for sliders (groups)
        for (const slider of sliders) {
            if (slider.is_group) {
                slider.children = await db.all('SELECT * FROM sliders WHERE project_id = ? AND parent_id = ? ORDER BY sort_order ASC', [projectId, slider.id]);
                slider.group = true; // map is_group to group for frontend
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
    const db = getDB();
    // Check if exists
    const exists = await db.get('SELECT id FROM menus WHERE project_id = ? AND link = ?', [projectId, link]);
    if (exists) {
        await db.run('UPDATE menus SET name = ? WHERE id = ?', [name, exists.id]);
    } else {
        const id = generateId();
        await db.run('INSERT INTO menus (id, project_id, name, link, sort_order) VALUES (?, ?, ?, ?, 0)', [id, projectId, name, link]);
    }
    res.json({ ok: true });
});

app.post('/glicon/menu/sort', verifyToken, async (req, res) => {
    const { projectId, data } = req.body; // data is array of menus
    const db = getDB();
    // Transaction?
    for (let i = 0; i < data.length; i++) {
        await db.run('UPDATE menus SET sort_order = ? WHERE project_id = ? AND link = ?', [i, projectId, data[i].link]);
    }
    res.json({ ok: true });
});

// 5. Slider/Doc Routes
app.get('/glicon/slider/all', verifyToken, async (req, res) => {
    // This seems to return flattened list or specific query?
    // http.js uses it in querySlider.
    // Implementation seems similar to menu/list but for all sliders?
    // Editor.vue uses it to get all sliders.
    const { projectId } = req.query;
    const db = getDB();
    const sliders = await db.all('SELECT * FROM sliders WHERE project_id = ?', [projectId]);
    res.json({ ok: true, data: sliders });
});

app.get('/glicon/slider/list', verifyToken, async (req, res) => {
    const { projectId, link } = req.query; // link is menu_link
    const db = getDB();
    
    if (!link) {
         // Fallback if no menu link provided, though Editor.vue sends it.
         const sliders = await db.all('SELECT * FROM sliders WHERE project_id = ? ORDER BY sort_order ASC', [projectId]);
         return res.json({ ok: true, data: sliders });
    }

    // Get top-level sliders for this menu
    const sliders = await db.all('SELECT * FROM sliders WHERE project_id = ? AND menu_link = ? AND parent_id IS NULL ORDER BY sort_order ASC', [projectId, link]);
    
    // Fetch children for groups
    for (const slider of sliders) {
        if (slider.is_group) {
            slider.children = await db.all('SELECT * FROM sliders WHERE project_id = ? AND parent_id = ? ORDER BY sort_order ASC', [projectId, slider.id]);
            slider.group = true; // map is_group to group for frontend
        } else {
            slider.group = false;
            slider.children = [];
        }
    }
    
    res.json({ ok: true, data: sliders });
});


app.post('/glicon/slider/save', verifyToken, async (req, res) => {
    const { projectId, link, data } = req.body; // link is menu_link, data is array of sliders
    const db = getDB();
    
    // We need to sync the sliders for this menu.
    // data structure: [{ name, link, group, children: [] }, ...]
    
    // Simplest strategy: Delete existing sliders for this menu and recreate? 
    // BUT we need to preserve content! content is in sliders table.
    
    // Better strategy: Upsert.
    
    // Flatten the data to process
    let order = 0;
    
    const processSlider = async (item, parentId = null) => {
        // Check existence by link + project_id
        // NOTE: link might not be unique across projects, but within project it should be?
        // Actually link is generated timestamp sometimes or user defined.
        
        let slider = await db.get('SELECT id, content FROM sliders WHERE project_id = ? AND link = ?', [projectId, item.link]);
        let id = slider ? slider.id : generateId();
        let content = slider ? slider.content : '';
        
        if (slider) {
            await db.run(`UPDATE sliders SET 
                name = ?, menu_link = ?, is_group = ?, parent_id = ?, sort_order = ?
                WHERE id = ?`, 
                [item.name, link, item.group, parentId, order++, id]);
        } else {
            await db.run(`INSERT INTO sliders 
                (id, project_id, menu_link, name, link, is_group, parent_id, sort_order, content)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, projectId, link, item.name, item.link, item.group, parentId, order++, content]);
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

app.get('/glicon/slider/item/list', verifyToken, async (req, res) => {
    const { projectId, item } = req.query; // item is the slider link
    const db = getDB();
    const slider = await db.get('SELECT content FROM sliders WHERE project_id = ? AND link = ?', [projectId, item]);
    res.json({ ok: true, data: slider ? slider.content : '' });
});

app.post('/glicon/slider/item/save', verifyToken, async (req, res) => {
    const { projectId, item, data } = req.body; // item is link, data is content
    const db = getDB();
    await db.run('UPDATE sliders SET content = ? WHERE project_id = ? AND link = ?', [data, projectId, item]);
    res.json({ ok: true });
});


// 6. File Upload
app.post('/glicon/file/upload', upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ ok: false, message: 'No file uploaded' });
    }
    // Return format expected by frontend: { fileName: "..." } or { url: "..." }
    // Editor.vue expects: res.fileName or res.url.
    // If fileName, it prepends host + /p/.
    // We return full URL in fileName to satisfy Editor.vue logic:
    // let url = res.fileName; if (!url && res.fileName) { ... } -> this block is skipped if url is truthy.
    // Wait, Editor.vue logic:
    // let url = res.fileName;
    // if (!url && res.fileName) { ... } -> This block is DEAD CODE if url assigned from res.fileName.
    // So if we return fileName as full URL, cb(url) will work.
    const fullUrl = `http://localhost:${PORT}/p/${req.file.filename}`;
    res.json({ 
        ok: true, 
        fileName: fullUrl,
        url: fullUrl 
    });
});

// 7. Collaboration
app.get('/glicon/project/collaborate', verifyToken, async (req, res) => {
    const db = getDB();
    const links = await db.all(`
        SELECT p.* FROM projects p
        JOIN project_links pl ON p.id = pl.project_id
        WHERE pl.email = ?
    `, [req.user.email]);
    res.json({ ok: true, data: links });
});

app.get('/glicon/project_link/users', verifyToken, async (req, res) => {
    const { projectId } = req.query;
    const db = getDB();
    const users = await db.all('SELECT * FROM project_links WHERE project_id = ?', [projectId]);
    res.json({ ok: true, data: users });
});

app.post('/glicon/project_link/save', verifyToken, async (req, res) => {
    const { projectId, email } = req.body;
    const db = getDB();
    // Check if user exists
    const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    const userId = user ? user.id : null;
    
    await db.run('INSERT INTO project_links (project_id, user_id, email) VALUES (?, ?, ?)', [projectId, userId, email]);

    // Get project name for email
    const project = await db.get('SELECT name FROM projects WHERE id = ?', [projectId]);
    const projectName = project ? project.name : 'Unknown Project';

    // Send collaboration email
    const subject = `协助邀请 - ${projectName}`;
    const text = `${email} 你好,你已经被${projectName}的管理员加入协作者,你现在可以对${projectName}贡献你的力量了`;
    sendEmail(email, subject, text);

    res.json({ ok: true });
});

app.get('/glicon/project_link/delete', verifyToken, async (req, res) => {
    const { projectId, uid } = req.query; 
    // uid passed from frontend is actually the project_links.id (the primary key of the link record)
    // because linkUsers list in frontend is populated from 'SELECT * FROM project_links'
    const db = getDB();
    
    // Try deleting by project_links.id first (which is unique enough, but let's keep projectId check for safety)
    // If uid matches project_links.id
    let result = await db.run('DELETE FROM project_links WHERE id = ? AND project_id = ?', [uid, projectId]);
    
    // Fallback: if no rows deleted (maybe uid was meant to be user_id or email), try that.
    // But given the frontend logic, it sends user.id which is the row id.
    // If we want to support both, we can check result.changes
    
    if (result.changes === 0) {
        // Try deleting by user_id or email (legacy support or if logic changes)
        result = await db.run('DELETE FROM project_links WHERE project_id = ? AND (user_id = ? OR email = ?)', [projectId, uid, uid]);
    }

    res.json({ ok: true });
});

// 8. Build
app.get('/glicon/project/build', verifyToken, (req, res) => {
    // Mock build
    res.json({ ok: true, message: 'Build triggered' });
});


// Start server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
