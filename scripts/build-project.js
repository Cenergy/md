const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Constants
const BASE_URL = `http://localhost:${process.env.PORT || 3001}/api`;
const SECRET_KEY = process.env.SECRET_KEY || 'md-test-secret-key';
// Generate a system token for build process
const TOKEN = jwt.sign({ id: 1, email: 'system@build', name: 'System Build' }, SECRET_KEY, { expiresIn: '1h' });

let PROJECT_ID = process.env.PROJECT_ID; // Can be updated if not provided
const DOCS_ROOT = path.resolve(__dirname, '../docs');

// New structure paths
const MARKDOWN_ROOT = path.join(DOCS_ROOT, 'markdown');
const OUTPUT_ROOT = path.join(DOCS_ROOT, 'vitepress');

const PROJECT_SOURCE_DIR = path.join(MARKDOWN_ROOT, PROJECT_ID || 'default');
const PROJECT_OUT_DIR = path.join(OUTPUT_ROOT, PROJECT_ID || 'default');

// Config path is now in the source dir
const VITEPRESS_DIR = path.join(PROJECT_SOURCE_DIR, ".vitepress");
const REGISTRY_PATH = path.join(VITEPRESS_DIR, "project-registry.json");

// --- Content Sanitization ---

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

function sanitizeContent(content) {
  if (!content) return "";

  content = content.replace(/::: swiper([\s\S]*?):::/g, (match, p1) => {
    return '::: swiper' + p1.replace(/^[ \t]+/gm, '') + ':::';
  });

  const parts = content.split(/(```[\s\S]*?```|`[^`]*`)/g);
  
  return parts.map(part => {
    if (part.startsWith('`')) return part;

    const normalized = part.replace(/^[ \t]+(?=<\/?[a-zA-Z])/gm, '');
    const lines = normalized.split(/\r?\n/);
    const processed = lines.map(line => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('<')) return line;
      return line.replace(/<([a-zA-Z][a-zA-Z0-9\-\.]*)/g, (match, tagName) => {
        const lowerTag = tagName.toLowerCase();
        if (!HTML_TAGS.has(lowerTag) || BLOCK_TAGS.has(lowerTag)) {
          return '&lt;' + tagName;
        }
        return match;
      });
    });

    return processed.join('\n');
  }).join('');
}

// --- Helpers ---

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function fetchApi(endpoint, params) {
    try {
        const res = await axios.get(`${BASE_URL}${endpoint}`, {
            params: { ...params, projectId: PROJECT_ID },
            headers: { token: TOKEN } 
        });
        return res.data.data;
    } catch (e) {
        console.error(`Failed to fetch ${endpoint}:`, e.message);
        return null;
    }
}

async function fetchProject() {
    const data = await fetchApi('/project/query', {});
    return data || { name: 'My Project' };
}

async function fetchMenus() {
    const data = await fetchApi('/menu/list', {});
    return data || [];
}

async function fetchSliders(link) {
    const data = await fetchApi('/slider/list', { link });
    return data || [];
}

async function fetchDoc(link, item, name) {
    const data = await fetchApi('/slider/item/list', { link, item, name });
    return data || "";
}

// --- Content Generation ---

async function processSliderItems(items, menuLink, parentDir) {
    const sidebarItems = [];
    
    for (const item of items) {
        // Sanitize name for file system
        const safeName = item.name.replace(/[\\/:*?"<>|]/g, '_').trim();
        if (!safeName) continue;

        if (item.group || (item.children && item.children.length > 0)) {
            // It's a group/folder
            const groupDir = path.join(parentDir, safeName);
            ensureDir(groupDir);
            
            const children = await processSliderItems(item.children || [], menuLink, groupDir);
            
            sidebarItems.push({
                text: item.name,
                collapsed: false,
                items: children
            });
        } else {
            // It's a file
            const fileName = `${safeName}.md`;
            const filePath = path.join(parentDir, fileName);
            
            const content = await fetchDoc(menuLink, item.link, item.name);
            const sanitizedContent = sanitizeContent(content || "");
            fs.writeFileSync(filePath, sanitizedContent);
            
            // Calculate relative link for sidebar
            const relDir = path.relative(PROJECT_SOURCE_DIR, parentDir);
            const urlPath = `/` + (relDir ? relDir.split(path.sep).join('/') + '/' : '') + fileName; 
            const linkPath = urlPath.replace(/\.md$/, '');
            
            sidebarItems.push({
                text: item.name,
                link: linkPath
            });
        }
    }
    return sidebarItems;
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

function generateVitePressConfig(projectName, nav, sidebar) {
    return `
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "${projectName}",
  description: "Documentation for ${projectName}",
  base: '/p/${PROJECT_ID}/', // Base URL set to project ID for centralized serving
  outDir: '${PROJECT_OUT_DIR.replace(/\\/g, '/')}', // Output directory
  
  themeConfig: {
    nav: ${JSON.stringify(nav, null, 2)},
    sidebar: ${JSON.stringify(sidebar, null, 2)},
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


// --- Registry Management ---

function loadRegistry() {
    ensureDir(VITEPRESS_DIR);
    if (fs.existsSync(REGISTRY_PATH)) {
        try {
            return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
        } catch (e) {
            console.error('Failed to parse registry, starting fresh.');
        }
    }
    return {};
}

function saveRegistry(registry) {
    ensureDir(VITEPRESS_DIR);
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

// --- Theme Management ---

function setupTheme(themeName) {
    const themeDir = path.join(VITEPRESS_DIR, 'theme');
    ensureDir(themeDir);
    
    const themeSrc = path.join(__dirname, '../public/theme', `${themeName}.css`);
    const themeDest = path.join(themeDir, 'custom.css');
    
    let hasCustomTheme = false;
    if (fs.existsSync(themeSrc)) {
        fs.copyFileSync(themeSrc, themeDest);
        hasCustomTheme = true;
        console.log(`Applied theme: ${themeName}`);
    } else {
        console.warn(`Theme CSS not found for: ${themeName}, using default.`);
    }

    const themeLayoutContent = `
<script setup>
import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'

const { Layout } = DefaultTheme
const route = useRoute()

const initTheme = () => {
  nextTick(() => {
    // Only apply .markdown-body to the document content, avoiding sidebar/nav
    // VPContent is the container for the main content area including doc, api, etc.
    const doc = document.querySelector('#VPContent')
    if (doc && !doc.classList.contains('markdown-body')) {
      doc.classList.add('markdown-body')
    }
  })
}

onMounted(() => {
  initTheme()
  // Observer for dynamic content changes
  const observer = new MutationObserver(() => {
    initTheme()
  })
  observer.observe(document.body, { childList: true, subtree: true })
})

watch(
  () => route.path,
  () => initTheme()
)
</script>

<template>
  <Layout />
</template>
`;
    fs.writeFileSync(path.join(themeDir, 'Layout.vue'), themeLayoutContent);

    const themeIndexContent = `
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
${hasCustomTheme ? "import './custom.css'" : ""}

export default {
  extends: DefaultTheme,
  Layout: Layout
}
`;
    fs.writeFileSync(path.join(themeDir, 'index.js'), themeIndexContent);
}

// --- Main Workflow ---

async function cleanAndSetupDirs() {
    // Clean Source Dir
    if (fs.existsSync(PROJECT_SOURCE_DIR)) {
        try {
            fs.rmSync(PROJECT_SOURCE_DIR, { recursive: true, force: true });
        } catch(e) {
            console.log('Warning: Could not clean project source dir, proceeding...');
        }
    }
    ensureDir(PROJECT_SOURCE_DIR);

    // Clean Output Dir
    if (fs.existsSync(PROJECT_OUT_DIR)) {
        try {
            fs.rmSync(PROJECT_OUT_DIR, { recursive: true, force: true });
        } catch(e) {
            console.log('Warning: Could not clean project output dir, proceeding...');
        }
    }
    ensureDir(PROJECT_OUT_DIR);
}

async function processMenu(menu) {
    console.log(`Processing Menu: ${menu.name}`);
    
    const menuLink = menu.link;
    const menuDir = path.join(PROJECT_SOURCE_DIR, menuLink);
    ensureDir(menuDir);

    const navItem = {
        text: menu.name,
        link: `/${menuLink}/`, 
        activeMatch: `/${menuLink}/`
    };

    const sliders = await fetchSliders(menuLink);
    const menuSidebarItems = await processSliderItems(sliders, menuLink, menuDir);
    
    // Create an index.md for the menu directory
    let indexContent = `# ${menu.name}\n\nSelect a topic from the sidebar.`;
    
    function findFirstLink(items) {
        for (const item of items) {
            if (item.link) return item.link;
            if (item.items) {
                const found = findFirstLink(item.items);
                if (found) return found;
            }
        }
        return null;
    }
    
    const firstLink = findFirstLink(menuSidebarItems);
    if (firstLink) {
            indexContent = `# ${menu.name}\n\n[Start Reading](${firstLink})`;
    }
    
    fs.writeFileSync(path.join(menuDir, 'index.md'), indexContent);

    return {
        navItem,
        sidebarKey: `/${menuLink}/`,
        sidebarItems: menuSidebarItems
    };
}

async function main() {
    if (!PROJECT_ID) {
        console.error('Error: PROJECT_ID is required. Usage: PROJECT_ID=... node scripts/build-project.js');
        process.exit(1);
    }

    console.log('Starting local build...');
    
    await cleanAndSetupDirs();

    const project = await fetchProject();
    console.log(`Project: ${project.name}`);

    // Setup Theme
    const themeName = (project.hero && project.hero.theme) || 'vitepress';
    setupTheme(themeName);

    const menus = await fetchMenus();
    console.log(`Found ${menus.length} menus`);

    // Create Home Page in Project Source Dir
    fs.writeFileSync(path.join(PROJECT_SOURCE_DIR, 'index.md'), generateHomeContent(project.name, menus));

    // Parallelize menu processing
    const results = await Promise.all(menus.map(menu => processMenu(menu)));

    const nav = [];
    const sidebar = {};

    results.forEach(res => {
        nav.push(res.navItem);
        sidebar[res.sidebarKey] = res.sidebarItems;
    });

    // Write Config and Root Home
    ensureDir(VITEPRESS_DIR);
    
    // Ensure no conflicting config.js exists
    const oldConfigPath = path.join(VITEPRESS_DIR, 'config.js');
    if (fs.existsSync(oldConfigPath)) {
        fs.unlinkSync(oldConfigPath);
    }

    fs.writeFileSync(path.join(VITEPRESS_DIR, 'config.mjs'), generateVitePressConfig(project.name, nav, sidebar));
    
    // No longer writing global registry or root index.md
    // fs.writeFileSync(path.join(DOCS_ROOT, 'index.md'), generateRootHomeContent(projectDataList));

    console.log('Data fetch complete. Building with VitePress...');
    
    try {
        // Execute build command for the specific project folder
        // Use 'vitepress build docs/markdown/PROJECT_ID'
        const relativeProjectSourceDir = path.relative(path.resolve(__dirname, '..'), PROJECT_SOURCE_DIR).replace(/\\/g, '/');
        console.log(`Building target: ${relativeProjectSourceDir}`);
        
        execSync(`npx vitepress build "${relativeProjectSourceDir}"`, { 
            stdio: 'inherit', 
            cwd: path.resolve(__dirname, '..') 
        });
        console.log('Build completed successfully!');
    } catch (e) {
        console.error('Build failed.');
        process.exit(1);
    }
}

main();
