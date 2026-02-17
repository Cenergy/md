// Lazy loader for heavy editor dependencies
export async function loadEditorPlugins() {
  if (window.__editorPluginsLoaded) return;

  // Import Styles
  import("highlight.js/styles/atom-one-dark.css");
  import("katex/dist/katex.min.css");
  import("swiper/css");
  import("viewerjs/dist/viewer.css");
  import("x-data-spreadsheet/dist/xspreadsheet.css");

  // Import Libraries and assign to window for legacy support
  const [hljs, mermaid, flowchart, QRCode, Swiper, XLSX, Spreadsheet, Raphael] =
    await Promise.all([
      import("highlight.js"),
      import("mermaid"),
      import("flowchart.js"),
      import("qrcode"),
      import("swiper"),
      import("xlsx"),
      import("x-data-spreadsheet"),
      import("raphael"),
    ]);

  window.hljs = hljs.default || hljs;
  window.mermaid = mermaid.default || mermaid;
  window.flowchart = flowchart.default || flowchart;
  window.QRCode = QRCode.default || QRCode;
  window.Swiper = Swiper.default || Swiper;
  window.XLSX = XLSX; // XLSX exports differently
  window.x_spreadsheet = Spreadsheet.default || Spreadsheet;
  window.Raphael = Raphael.default || Raphael;

  // Load Legacy Scripts (must run after globals are set)
  // We use standard dynamic imports for these side-effect scripts
  await import("@/utils/common-utils.js");
  await import("@/utils/prettier-loader.js");
  await import("@/lib/domclickoutside.min.js");
  
  try {
    // 关键修复：导入 ESM 格式的 mdpress-monaco-editor，并手动挂载到 window.mdpress
    // 因为 ESM 模块不会自动污染全局变量，而 mdeditorplugins.js 依赖 window.mdpress
    const mdpressModule = await import("mdpress-monaco-editor");
    window.mdpress = mdpressModule.default || mdpressModule;
    
    await import("@/lib/mdeditorplugins.js");
  } catch (e) {
    console.error("Failed to load mdpress plugins", e);
  }

  try {
    await import("@/lib/filednd.min.js");
  } catch (e) {
    console.error("Failed to load filednd", e);
  }

  window.__editorPluginsLoaded = true;
}
