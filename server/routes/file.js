const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config');

// File Upload Setup
const uploadDir = path.join(__dirname, '../', config.upload.dir || 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = crypto.randomUUID() + ext;
        cb(null, name)
    }
});
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: config.upload.maxSize || 5 * 1024 * 1024, // Use config or default 5MB
    },
    fileFilter: (req, file, cb) => {
        // Only allow images
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

router.post('/file/upload', (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(400).json({ ok: false, message: `Upload error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(400).json({ ok: false, message: err.message });
        }
        
        // Everything went fine.
        next();
    });
}, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ ok: false, message: 'No file uploaded' });
    }
    // Construct URL dynamically based on request
    const protocol = req.protocol;
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({ 
        ok: true, 
        fileName: fullUrl,
        url: fullUrl 
    });
});

module.exports = router;
