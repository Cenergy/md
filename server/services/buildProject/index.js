const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PROJECT_ROOT, PROJECT_ID, createBuildPaths } = require('./config');
const { resetDirectory, toPosixPath } = require('./utils');
const { fetchProject, fetchMenus } = require('./api');
const { generateHomeContent, setupTheme, writeVitePressConfig } = require('./generator');
const { processMenu, toNavigationAndSidebar } = require('./processor');

// 构建路径
const buildPaths = createBuildPaths(PROJECT_ID);

// 清理并设置目录
async function cleanAndSetupDirs() {
  resetDirectory(
    buildPaths.projectSourceDir,
    'Warning: Could not clean project source dir'
  );
  resetDirectory(
    buildPaths.projectOutDir,
    'Warning: Could not clean project output dir'
  );
}

// 执行VitePress构建
function runVitePressBuild() {
  const relativeSourceDir = toPosixPath(
    path.relative(PROJECT_ROOT, buildPaths.projectSourceDir)
  );
  console.log(`Building target: ${relativeSourceDir}`);

  if (/[;&|`$()]/.test(relativeSourceDir)) {
    throw new Error(`Invalid path detected: ${relativeSourceDir}`);
  }

  execSync(`npx vitepress build "${relativeSourceDir}"`, {
    stdio: 'inherit',
    cwd: PROJECT_ROOT
  });
}

// 主函数
async function main() {
  console.log('Starting local build...');
  await cleanAndSetupDirs();

  const project = await fetchProject();
  console.log(`Project: ${project.name}`);

  const themeName = (project.hero && project.hero.theme) || 'vitepress';
  setupTheme(themeName, buildPaths.vitepressDir, PROJECT_ROOT);

  const menus = await fetchMenus();
  console.log(`Found ${menus.length} menus`);

  fs.writeFileSync(
    path.join(buildPaths.projectSourceDir, 'index.md'),
    generateHomeContent(project.name, menus)
  );

  const menuResults = await Promise.allSettled(
    menus.map(menu => processMenu(menu, buildPaths.projectSourceDir))
  );

  const successfulResults = menuResults
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  const failedCount = menuResults.filter(r => r.status === 'rejected').length;
  if (failedCount > 0) {
    console.warn(`Warning: ${failedCount} menu(s) failed to process`);
  }

  const { nav, sidebar } = toNavigationAndSidebar(successfulResults);
  writeVitePressConfig(project.name, nav, sidebar, buildPaths.vitepressDir, buildPaths.projectOutDir);

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
