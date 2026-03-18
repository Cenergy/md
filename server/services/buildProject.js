const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const jwt = require('jsonwebtoken');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
require('dotenv').config({ path: path.resolve(PROJECT_ROOT, '.env') });

const BASE_URL = `http://localhost:${process.env.PORT || 3001}/api`;
const SECRET_KEY = process.env.SECRET_KEY || 'md-test-secret-key';
const PROJECT_ID = process.env.PROJECT_ID;
const TOKEN = jwt.sign(
  { id: 1, email: 'system@build', name: 'System Build' },
  SECRET_KEY,
  { expiresIn: '1h' }
);

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

async function fetchApi(endpoint, params) {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: { ...params, projectId: PROJECT_ID },
      headers: { token: TOKEN }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error.message);
    return null;
  }
}

async function fetchProject() {
  const project = await fetchApi('/project/query', {});
  return project || { name: 'My Project' };
}

async function fetchMenus() {
  const menus = await fetchApi('/menu/list', {});
  return menus || [];
}

async function fetchSliders(menuLink) {
  const sliders = await fetchApi('/slider/list', { link: menuLink });
  return sliders || [];
}

async function fetchDoc(menuLink, itemLink, itemName) {
  const doc = await fetchApi('/slider/item/list', { link: menuLink, item: itemLink, name: itemName });
  return doc || '';
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
    const rawDocContent = await fetchDoc(menuLink, item.link, item.name);
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

function generateVitePressConfig(projectName, navItems, sidebarMap) {
  return `
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "${projectName}",
  description: "Documentation for ${projectName}",
  base: '/p/${PROJECT_ID}/',
  outDir: '${toPosixPath(buildPaths.projectOutDir)}',
  
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
  return `
<script setup>
import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'

const { Layout } = DefaultTheme
const route = useRoute()
const twikooEnvId = ${JSON.stringify(process.env.TWIKOO_ENV_ID || '')}
const enableTwikoo = twikooEnvId !== ''

const initTheme = () => {
  nextTick(() => {
    // 仅给正文区域添加 markdown-body，避免影响导航和侧边栏
    const doc = document.querySelector('#VPContent')
    if (doc && !doc.classList.contains('markdown-body')) {
      doc.classList.add('markdown-body')
    }
  })
}

const initTwikoo = () => {
  if (!enableTwikoo) return
  nextTick(() => {
    const container = document.getElementById('twikoo-container')
    if (!container) return
    container.innerHTML = ''
    const runInit = () => {
      if (window.twikoo) {
        window.twikoo.init({ envId: twikooEnvId, el: '#twikoo-container' })
      }
    }
    if (window.twikoo) {
      runInit()
      return
    }
    const existing = document.querySelector('script[data-twikoo]')
    if (existing) {
      const timer = setInterval(() => {
        if (window.twikoo) {
          clearInterval(timer)
          runInit()
        }
      }, 50)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://registry.npmmirror.com/twikoo/1.7.3/files/dist/twikoo.min.js'
    script.async = true
    script.dataset.twikoo = 'true'
    script.onload = runInit
    document.head.appendChild(script)
  })
}

onMounted(() => {
  initTheme()
  initTwikoo()
  // 路由切换和动态渲染时持续校准正文容器样式
  const observer = new MutationObserver(() => {
    initTheme()
  })
  observer.observe(document.body, { childList: true, subtree: true })
})

watch(
  () => route.path,
  () => {
    initTheme()
    initTwikoo()
  }
)
</script>

<template>
  <Layout>
    <template #doc-after>
      <div v-if="enableTwikoo" id="twikoo-container"></div>
    </template>
  </Layout>
</template>
`;
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
