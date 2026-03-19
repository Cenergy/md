const path = require('path');
const fs = require('fs');
const { ensureDir, sanitizeFileName } = require('./utils');
const { sanitizeContent } = require('./sanitizer');
const { fetchSliders, fetchDoc } = require('./api');
const { buildSidebarLink, generateMenuIndexContent } = require('./generator');

// 处理侧边栏项目
async function processSliderItems(items, menuLink, parentDir, projectSourceDir) {
  const sidebarItems = [];

  for (const item of items) {
    const safeName = sanitizeFileName(item.name);
    if (!safeName) continue;

    const hasChildren = item.group || (item.children && item.children.length > 0);
    
    if (hasChildren) {
      const groupDir = path.join(parentDir, safeName);
      ensureDir(groupDir);

      const childrenSidebar = await processSliderItems(
        item.children || [], menuLink, groupDir, projectSourceDir
      );
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
      link: buildSidebarLink(projectSourceDir, parentDir, fileName)
    });
  }

  return sidebarItems;
}

// 处理单个菜单
async function processMenu(menu, projectSourceDir) {
  console.log(`Processing Menu: ${menu.name}`);

  const menuLink = menu.link;
  const menuDir = path.join(projectSourceDir, menuLink);
  ensureDir(menuDir);

  const navItem = {
    text: menu.name,
    link: `/${menuLink}/`,
    activeMatch: `/${menuLink}/`
  };

  const sliders = await fetchSliders(menuLink);
  const sidebarItems = await processSliderItems(sliders, menuLink, menuDir, projectSourceDir);
  
  const menuIndexContent = generateMenuIndexContent(menu.name, sidebarItems);
  fs.writeFileSync(path.join(menuDir, 'index.md'), menuIndexContent);

  return {
    navItem,
    sidebarKey: `/${menuLink}/`,
    sidebarItems
  };
}

// 转换为导航和侧边栏结构
function toNavigationAndSidebar(menuResults) {
  const nav = [];
  const sidebar = {};

  for (const result of menuResults) {
    nav.push(result.navItem);
    sidebar[result.sidebarKey] = result.sidebarItems;
  }

  return { nav, sidebar };
}

module.exports = {
  processSliderItems,
  processMenu,
  toNavigationAndSidebar
};
