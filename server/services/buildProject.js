const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const prisma = require('../utils/prisma');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
require('dotenv').config({ path: path.resolve(PROJECT_ROOT, '.env') });
const THEME_LAYOUT_TEMPLATE_PATH = path.join(__dirname, 'templates', 'vitepress-layout.vue');
const THEME_TWIKOO_TEMPLATE_PATH = path.join(__dirname, 'templates', 'Twikoo.vue');
const TWIKOO_ENV_PLACEHOLDER = '__TWIKOO_ENV_ID__';

const PROJECT_ID = process.env.PROJECT_ID;

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

function createBuildPaths(projectId) {
  const docsRoot = path.resolve(PROJECT_ROOT, 'docs');
  const markdownRoot = path.join(docsRoot, 'markdown');
  const outputRoot = path.join(docsRoot, 'vitepress');
  const projectSourceDir = path.join(markdownRoot, projectId);
  const projectOutDir = path.join(outputRoot, projectId);
  const vitepressDir = path.join(projectSourceDir, '.vitepress');
  return {
    docsRoot,
    markdownRoot,
    outputRoot,
    projectSourceDir,
    projectOutDir,
    vitepressDir
  };
}

const buildPaths = createBuildPaths(PROJECT_ID || 'default');

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
      console.log(warningMessage);
    }
  }
  ensureDir(dirPath);
}

function toPosixPath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function sanitizeFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim();
}

function normalizeSwiperIndent(content) {
  return content.replace(/::: swiper([\s\S]*?):::/g, (_, swiperContent) => {
    return `::: swiper${swiperContent.replace(/^[ \t]+/gm, '')}:::`;
  });
}

function escapeUnsafeTag(line) {
  const trimmedLine = line.trimStart();
  if (trimmedLine.startsWith('<')) {
    return line;
  }

  return line.replace(/<([a-zA-Z][a-zA-Z0-9\-\.]*)/g, (match, tagName) => {
    const normalizedTag = tagName.toLowerCase();
    if (!HTML_TAGS.has(normalizedTag) || BLOCK_TAGS.has(normalizedTag)) {
      return `&lt;${tagName}`;
    }
    return match;
  });
}

function sanitizeNonCodePart(contentPart) {
  const normalizedIndent = contentPart.replace(/^[ \t]+(?=<\/?[a-zA-Z])/gm, '');
  return normalizedIndent
    .split(/\r?\n/)
    .map(escapeUnsafeTag)
    .join('\n');
}

function sanitizeContent(content) {
  if (!content) {
    return '';
  }

  const contentWithNormalizedSwiper = normalizeSwiperIndent(content);
  const segments = contentWithNormalizedSwiper.split(/(```[\s\S]*?```|`[^`]*`)/g);

  return segments
    .map((segment) => (segment.startsWith('`') ? segment : sanitizeNonCodePart(segment)))
    .join('');
}

/**
 * 直接从数据库获取项目信息
 */
async function fetchProject() {
  const project = await prisma.projects.findUnique({
    where: { id: PROJECT_ID }
  });
  if (!project) return { name: 'My Project' };
  
  // 解析 hero 字段
  let hero = {};
  try {
    hero = JSON.parse(project.hero || '{}');
  } catch (e) {}
  
  return { ...project, hero };
}

/**
 * 直接从数据库获取菜单列表
 */
async function fetchMenus() {
  const menus = await prisma.menus.findMany({
    where: { project_id: PROJECT_ID },
    orderBy: { sort_order: 'asc' }
  });
  return menus || [];
}

/**
 * 直接从数据库获取侧边栏项（带层级结构）
 */
async function fetchSliders(menuLink) {
  const sliders = await prisma.sliders.findMany({
    where: {
      project_id: PROJECT_ID,
      menu_link: menuLink,
      parent_id: null
    },
    orderBy: { sort_order: 'asc' }
  });
  
  // 构建层级结构
  for (const slider of sliders) {
    if (slider.is_group) {
      slider.children = await prisma.sliders.findMany({
        where: {
          project_id: PROJECT_ID,
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
  
  return sliders || [];
}

/**
 * 直接从数据库获取文档内容
 */
async function fetchDoc(itemLink) {
  const slider = await prisma.sliders.findFirst({
    where: {
      project_id: PROJECT_ID,
      link: itemLink
    }
  });
  return slider ? slider.content : '';
}

function buildSidebarLink(parentDir, fileName) {
  const relativeDir = path.relative(buildPaths.projectSourceDir, parentDir);
  const relativePrefix = relativeDir ? `${toPosixPath(relativeDir)}/` : '';
  return `/${relativePrefix}${fileName}`.replace(/\.md$/, '');
}

async function processSliderItems(items, menuLink, parentDir) {
  const sidebarItems = [];

  for (const item of items) {
    const safeName = sanitizeFileName(item.name);
    if (!safeName) {
      continue;
    }

    const hasChildren = item.group || (item.children && item.children.length > 0);
    if (hasChildren) {
      const groupDir = path.join(parentDir, safeName);
      ensureDir(groupDir);

      const childrenSidebar = await processSliderItems(item.children || [], menuLink, groupDir);
      sidebarItems.push({
        text: item.name,
        collapsed: false,
        items: childrenSidebar
      });
      continue;
    }

    const fileName = `${safeName}.md`;
    const filePath = path.join(parentDir, fileName);
    const rawDocContent = await fetchDoc(item.link);
    fs.writeFileSync(filePath, sanitizeContent(rawDocContent));

    sidebarItems.push({
      text: item.name,
      link: buildSidebarLink(parentDir, fileName)
    });
  }

  return sidebarItems;
}

function findFirstSidebarLink(items) {
  for (const item of items) {
    if (item.link) {
      return item.link;
    }
    if (item.items) {
      const nestedLink = findFirstSidebarLink(item.items);
      if (nestedLink) {
        return nestedLink;
      }
    }
  }
  return null;
}

function generateMenuIndexContent(menuName, sidebarItems) {
  const firstLink = findFirstSidebarLink(sidebarItems);
  if (firstLink) {
    return `# ${menuName}\n\n[Start Reading](${firstLink})`;
  }
  return `# ${menuName}\n\nSelect a topic from the sidebar.`;
}

function generateHomeContent(projectName, menus) {
  return `---
layout: home

hero:
  name: "${projectName}"
  text: "Documentation"
  tagline: "Generated by MDPress"
  actions:
    - theme: brand
      text: Get Started
      link: ${menus.length > 0 ? `/${menus[0].link}/` : `/`}

features:
  - title: Markdown Support
    details: Native Markdown support with extended features.
  - title: Vue-Powered
    details: Built with Vue 3 and VitePress.
---`;
}

// 第三方 CDN 资源配置
const THIRD_PARTY_SCRIPTS = [
  { tag: 'script', src: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/raphael/2.3.0/raphael.min.js' },
  { tag: 'script', src: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/flowchart/1.17.1/flowchart.min.js' },
  { tag: 'script', src: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/viewerjs/1.11.5/viewer.min.js' },
  { tag: 'script', src: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/xlsx/0.18.5/xlsx.full.min.js' },
  { tag: 'link', rel: 'stylesheet', href: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/KaTeX/0.16.9/katex.min.css' },
  { tag: 'script', src: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/KaTeX/0.16.9/katex.min.js' },
  { tag: 'script', src: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/mermaid/10.6.1/mermaid.min.js' },
  { tag: 'script', src: 'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/plantuml-encoder/1.4.0/plantuml-encoder.min.js' },
];

// 生成 head 配置
function generateHeadConfig() {
  const head = THIRD_PARTY_SCRIPTS.map(item => {
    if (item.tag === 'script') {
      return ['script', { src: item.src }];
    } else if (item.tag === 'link') {
      return ['link', { rel: item.rel, href: item.href }];
    }
    return null;
  }).filter(Boolean);
  return JSON.stringify(head, null, 2);
}

// 生成 markdown-it 插件文件
function generateMarkdownPluginsFile() {
  return `// 自定义 markdown-it 插件
import container from 'markdown-it-container'

// 通用 container 渲染函数
function createContainerRender(className) {
  return (tokens, idx) => {
    if (tokens[idx].nesting === 1) {
      return \`<div class="\${className}"><pre class="source" style="display:none">\`
    } else {
      return '</pre></div>\\n'
    }
  }
}

// Flowchart 插件
function flowchartPlugin(md) {
  md.use(container, 'flowchart', {
    validate: (params) => params.trim().match(/^flowchart\\s*$/),
    render: createContainerRender('flowchart-container'),
    marker: ':'
  })
}

// Mermaid 插件  
function mermaidPlugin(md) {
  md.use(container, 'mermaid', {
    validate: (params) => params.trim().match(/^mermaid\\s*$/),
    render: createContainerRender('mermaid-container'),
    marker: ':'
  })
}

// KaTeX 块级插件
function katexPlugin(md) {
  md.use(container, 'katex', {
    validate: (params) => params.trim() === 'katex',
    render: createContainerRender('katex-container'),
    marker: ':'
  })
}

// Swiper 插件
function swiperPlugin(md) {
  md.use(container, 'swiper', {
    validate: (params) => params.trim() === 'swiper',
    render: (tokens, idx) => {
      if (tokens[idx].nesting === 1) {
        return '<div class="swiper-content">\\n'
      } else {
        return '</div>\\n'
      }
    },
    marker: ':'
  })
}

// Qrcode 插件
function qrcodePlugin(md) {
  md.use(container, 'qrcode', {
    validate: (params) => params.trim() === 'qrcode',
    render: createContainerRender('qrcode-container'),
    marker: ':'
  })
}

export function setupMarkdownPlugins(md) {
  flowchartPlugin(md)
  mermaidPlugin(md)
  katexPlugin(md)
  swiperPlugin(md)
  qrcodePlugin(md)
}
`;
}

function generateVitePressConfig(projectName, navItems, sidebarMap) {
  return `
import { defineConfig } from 'vitepress'
import { setupMarkdownPlugins } from './markdown-plugins.mjs'

export default defineConfig({
  title: "${projectName}",
  description: "Documentation for ${projectName}",
  base: '/p/${PROJECT_ID}/',
  outDir: '${toPosixPath(buildPaths.projectOutDir)}',
  
  head: ${generateHeadConfig()},
  
  markdown: {
    config: (md) => {
      setupMarkdownPlugins(md)
    }
  },
  
  themeConfig: {
    nav: ${JSON.stringify(navItems, null, 2)},
    sidebar: ${JSON.stringify(sidebarMap, null, 2)},
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
`;
}

function createThemeLayoutContent() {
  const template = fs.readFileSync(THEME_LAYOUT_TEMPLATE_PATH, 'utf-8');
  return template.replace(TWIKOO_ENV_PLACEHOLDER, JSON.stringify(process.env.TWIKOO_ENV_ID || ''));
}

function createTwikooCommentsContent() {
  return fs.readFileSync(THEME_TWIKOO_TEMPLATE_PATH, 'utf-8');
}

function createThemeIndexContent(hasCustomTheme) {
  return `
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
${hasCustomTheme ? "import './custom.css'" : ""}

export default {
  extends: DefaultTheme,
  Layout: Layout
}
`;
}

function setupTheme(themeName) {
  const themeDir = path.join(buildPaths.vitepressDir, 'theme');
  ensureDir(themeDir);

  const themeSourcePath = path.join(PROJECT_ROOT, 'public/theme', `${themeName}.css`);
  const themeDestPath = path.join(themeDir, 'custom.css');
  let hasCustomTheme = false;

  if (fs.existsSync(themeSourcePath)) {
    fs.copyFileSync(themeSourcePath, themeDestPath);
    hasCustomTheme = true;
    console.log(`Applied theme: ${themeName}`);
  } else {
    console.warn(`Theme CSS not found for: ${themeName}, using default.`);
  }

  fs.writeFileSync(path.join(themeDir, 'Layout.vue'), createThemeLayoutContent());
  fs.writeFileSync(path.join(themeDir, 'Twikoo.vue'), createTwikooCommentsContent());
  fs.writeFileSync(path.join(themeDir, 'index.js'), createThemeIndexContent(hasCustomTheme));
}

async function cleanAndSetupDirs() {
  resetDirectory(
    buildPaths.projectSourceDir,
    'Warning: Could not clean project source dir, proceeding...'
  );
  resetDirectory(
    buildPaths.projectOutDir,
    'Warning: Could not clean project output dir, proceeding...'
  );
}

async function processMenu(menu) {
  console.log(`Processing Menu: ${menu.name}`);

  const menuLink = menu.link;
  const menuDir = path.join(buildPaths.projectSourceDir, menuLink);
  ensureDir(menuDir);

  const navItem = {
    text: menu.name,
    link: `/${menuLink}/`,
    activeMatch: `/${menuLink}/`
  };

  const sliders = await fetchSliders(menuLink);
  const sidebarItems = await processSliderItems(sliders, menuLink, menuDir);
  const menuIndexContent = generateMenuIndexContent(menu.name, sidebarItems);
  fs.writeFileSync(path.join(menuDir, 'index.md'), menuIndexContent);

  return {
    navItem,
    sidebarKey: `/${menuLink}/`,
    sidebarItems
  };
}

function toNavigationAndSidebar(menuResults) {
  const nav = [];
  const sidebar = {};

  for (const result of menuResults) {
    nav.push(result.navItem);
    sidebar[result.sidebarKey] = result.sidebarItems;
  }

  return { nav, sidebar };
}

function writeVitePressConfig(projectName, nav, sidebar) {
  ensureDir(buildPaths.vitepressDir);
  removeFileIfExists(path.join(buildPaths.vitepressDir, 'config.js'));
  
  // 生成 markdown 插件文件
  fs.writeFileSync(
    path.join(buildPaths.vitepressDir, 'markdown-plugins.mjs'),
    generateMarkdownPluginsFile()
  );
  
  // 生成配置文件
  fs.writeFileSync(
    path.join(buildPaths.vitepressDir, 'config.mjs'),
    generateVitePressConfig(projectName, nav, sidebar)
  );
}

function runVitePressBuild() {
  const relativeSourceDir = toPosixPath(path.relative(PROJECT_ROOT, buildPaths.projectSourceDir));
  console.log(`Building target: ${relativeSourceDir}`);

  execSync(`npx vitepress build "${relativeSourceDir}"`, {
    stdio: 'inherit',
    cwd: PROJECT_ROOT
  });
}

async function main() {
  if (!PROJECT_ID) {
    console.error('Error: PROJECT_ID is required. Usage: PROJECT_ID=... node server/services/build-project.js');
    process.exit(1);
  }

  console.log('Starting local build...');
  await cleanAndSetupDirs();

  const project = await fetchProject();
  console.log(`Project: ${project.name}`);

  const themeName = (project.hero && project.hero.theme) || 'vitepress';
  setupTheme(themeName);

  const menus = await fetchMenus();
  console.log(`Found ${menus.length} menus`);

  fs.writeFileSync(
    path.join(buildPaths.projectSourceDir, 'index.md'),
    generateHomeContent(project.name, menus)
  );

  const menuResults = await Promise.all(menus.map((menu) => processMenu(menu)));
  const { nav, sidebar } = toNavigationAndSidebar(menuResults);
  writeVitePressConfig(project.name, nav, sidebar);

  console.log('Data fetch complete. Building with VitePress...');
  try {
    runVitePressBuild();
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed.');
    process.exit(1);
  }
}

main();
