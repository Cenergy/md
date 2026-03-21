const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config');

// Magic Number signatures for image validation
const IMAGE_SIGNATURES = {
    'image/jpeg': [
        [0xFF, 0xD8, 0xFF] // JPEG
    ],
    'image/png': [
        [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] // PNG
    ],
    'image/gif': [
        [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
        [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]  // GIF89a
    ],
    'image/webp': [
        [0x52, 0x49, 0x46, 0x46] // RIFF (WebP starts with RIFF...WEBP)
    ],
    'image/bmp': [
        [0x42, 0x4D] // BM
    ],
    'image/svg+xml': [] // SVG is text-based, no magic number
};

/**
 * Validate file by checking magic number (file signature)
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - Declared MIME type
 * @returns {boolean} - Whether the file matches its declared type
 */
function validateMagicNumber(buffer, mimeType) {
    // SVG is text-based, validate by checking content
    if (mimeType === 'image/svg+xml') {
        const content = buffer.toString('utf8').toLowerCase();
        return content.includes('<svg') || content.includes('<?xml');
    }

    const signatures = IMAGE_SIGNATURES[mimeType];
    if (!signatures || signatures.length === 0) {
        return false;
    }

    for (const sig of signatures) {
        let match = true;
        for (let i = 0; i < sig.length; i++) {
            if (buffer[i] !== sig[i]) {
                match = false;
                break;
            }
        }
        if (match) {
            // Special check for WebP: need to verify "WEBP" at offset 8
            if (mimeType === 'image/webp') {
                const webpMarker = buffer.slice(8, 12).toString('ascii');
                return webpMarker === 'WEBP';
            }
            return true;
        }
    }
    return false;
}

/**
 * Get actual MIME type from magic number
 * @param {Buffer} buffer - File buffer
 * @returns {string|null} - Detected MIME type or null
 */
function detectMimeType(buffer) {
    for (const [mimeType, signatures] of Object.entries(IMAGE_SIGNATURES)) {
        if (mimeType === 'image/svg+xml') continue;
        
        for (const sig of signatures) {
            let match = true;
            for (let i = 0; i < sig.length; i++) {
                if (buffer[i] !== sig[i]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                if (mimeType === 'image/webp') {
                    const webpMarker = buffer.slice(8, 12).toString('ascii');
                    if (webpMarker !== 'WEBP') continue;
                }
                return mimeType;
            }
        }
    }
    return null;
}

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
        
        // Check if MIME type is supported
        if (!IMAGE_SIGNATURES[file.mimetype]) {
            return cb(new Error(`Unsupported image type: ${file.mimetype}`), false);
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
    
    // Validate magic number to ensure file content matches declared type
    const filePath = req.file.path;
    try {
        const fileBuffer = fs.readFileSync(filePath);
        
        // Validate magic number
        if (!validateMagicNumber(fileBuffer, req.file.mimetype)) {
            // File content doesn't match declared type - delete and reject
            fs.unlinkSync(filePath);
            const detectedType = detectMimeType(fileBuffer);
            const errorMsg = detectedType 
                ? `File content mismatch: declared as ${req.file.mimetype} but detected as ${detectedType}`
                : 'Invalid image file: content does not match any supported image format';
            return res.status(400).json({ ok: false, message: errorMsg });
        }
    } catch (e) {
        // If we can't read the file, clean up and reject
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return res.status(500).json({ ok: false, message: 'Failed to validate file' });
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
