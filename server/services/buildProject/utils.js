const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function removeFileIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function resetDirectory(dirPath, warningMessage) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
    } catch (error) {
      console.error(warningMessage);
      console.error(`Error: ${error.message}`);
      throw error;
    }
  }
  ensureDir(dirPath);
}

function toPosixPath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function sanitizeFileName(name) {
  if (!name || typeof name !== 'string') return 'unnamed';
  
  let sanitized = name.replace(/[\\/:*?"<>|]/g, '_').trim();
  sanitized = sanitized.replace(/^[\s.]+|[\s.]+$/g, '');
  
  if (sanitized === '..' || sanitized.includes('..')) {
    sanitized = sanitized.replace(/\.\./g, '_');
  }
  
  return sanitized || 'unnamed';
}

module.exports = {
  ensureDir,
  removeFileIfExists,
  resetDirectory,
  toPosixPath,
  sanitizeFileName
};
