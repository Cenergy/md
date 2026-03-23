const path = require('path');
const jwt = require('jsonwebtoken');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
require('dotenv').config({ path: path.resolve(PROJECT_ROOT, '.env') });

// 环境变量校验
const PROJECT_ID = process.env.PROJECT_ID;
const SECRET_KEY = process.env.SECRET_KEY;

if (!PROJECT_ID) {
  console.error('Error: PROJECT_ID is required');
  process.exit(1);
}

if (!SECRET_KEY) {
  console.error('Error: SECRET_KEY is required');
  process.exit(1);
}

// JWT Token
const TOKEN = jwt.sign(
  { id: 1, email: 'system@build', name: 'System Build' },
  SECRET_KEY,
  { expiresIn: '1h' }
);

// API配置
const BASE_URL = `http://localhost:${process.env.PORT || 3001}/api`;

// 模板路径
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
const THEME_LAYOUT_TEMPLATE = path.join(TEMPLATES_DIR, 'vitepress-layout.vue');
const THEME_TWIKOO_TEMPLATE = path.join(TEMPLATES_DIR, 'Twikoo.vue');
const TWIKOO_ENV_PLACEHOLDER = '__TWIKOO_ENV_ID__';

// HTML标签集合
const HTML_TAGS = new Set([
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo',
  'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col',
  'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div',
  'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i',
  'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main',
  'map', 'mark', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup',
  'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt',
  'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span',
  'strong', 'style', 'sub', 'summary', 'sup', 'svg', 'table', 'tbody', 'td',
  'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track',
  'u', 'ul', 'var', 'video', 'wbr'
]);

const BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'blockquote', 'details', 'dialog', 'div', 'dl',
  'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4',
  'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section',
  'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
]);

// 构建路径
function createBuildPaths(projectId) {
  const docsRoot = path.resolve(PROJECT_ROOT, 'docs');
  const markdownRoot = path.join(docsRoot, 'markdown');
  const outputRoot = path.join(docsRoot, 'vitepress');
  return {
    docsRoot,
    markdownRoot,
    outputRoot,
    projectSourceDir: path.join(markdownRoot, projectId),
    projectOutDir: path.join(outputRoot, projectId),
    vitepressDir: path.join(markdownRoot, projectId, '.vitepress')
  };
}

module.exports = {
  PROJECT_ROOT,
  PROJECT_ID,
  SECRET_KEY,
  TOKEN,
  BASE_URL,
  TEMPLATES_DIR,
  THEME_LAYOUT_TEMPLATE,
  THEME_TWIKOO_TEMPLATE,
  TWIKOO_ENV_PLACEHOLDER,
  HTML_TAGS,
  BLOCK_TAGS,
  createBuildPaths
};
