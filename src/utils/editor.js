import * as monaco from 'monaco-editor'

let mdEditor = null;

export function getEditor() {
    return mdEditor;
}

export function destroyEditor() {
    if (mdEditor) {
        // Try to dispose monaco instance if exposed
        if (mdEditor.editor && typeof mdEditor.editor.dispose === 'function') {
            mdEditor.editor.dispose();
        }
        // If MDEditor has a dispose/destroy method, call it
        if (typeof mdEditor.dispose === 'function') {
            mdEditor.dispose();
        }
        mdEditor = null;
    }
}

export function loadMonaco(callback) {
    if (window.registerMdPlugins) {
        window.registerMdPlugins();
    }
    if (window.mdpress) {
        window.mdpress.registerMonaco(monaco);
    }
    if (callback) callback();
}

export function createEditor(selector, config, callback) {
    if (getEditor()) {
        if (callback) callback();
        return getEditor();
    }

    const mdpress = window.mdpress;
    if (!mdpress) {
        console.error("mdpress not found");
        return;
    }

    const theme = config.theme || "vitepress";
    
    mdEditor = new mdpress.MDEditor(selector, {
        autoParseVSCodePasteData: true,
        // themeURL: "./theme/", 
        monacoOptions: {
            minimap: { enabled: false }
        }
    });
    
    mdEditor.setTheme(theme);

    // Event listeners
    const LEFT_NAV_FLOAT = "left-nav-float";
    const ANIMATION_FADEINLEFT = "animate__fadeInLeft";

    getEditor().on("closefullscreen", function() {
        const leftNav = config.getLeftNav ? config.getLeftNav() : null;
        if (leftNav) {
            const classList = leftNav.classList;
            classList.remove(LEFT_NAV_FLOAT);
            classList.remove(ANIMATION_FADEINLEFT);
        }
    });

    // Paste handler
    getEditor().on("paste", function(e) {
        const files = e.clipboardData.files || [];
        if (files.length > 0) {
             // Basic implementation of file upload on paste
             // The original logic filtered by size (20MB) and count (10)
             // and called config.uploadFile
             Array.from(files).forEach(file => {
                 if (file.size > 20 * 1024 * 1024) {
                     if (config.warn) config.warn(`文件 ${file.name} 超过 20M，跳过上传`);
                     return;
                 }
                 if (config.uploadFile) {
                    config.uploadFile(file, (url) => {
                        // Insert markdown image or link
                        const isImage = file.type.startsWith('image/');
                        const text = isImage ? `![${file.name}](${url})` : `[${file.name}](${url})`;
                        
                        const range = getEditor().getCurrentRange()[0];
                        getEditor().editor.executeEdits("", [{ range: range, text: "\n" + text + "\n" }]);
                    });
                 }
             });
        }
    });

    addToolicons(config);

    if (callback) callback();
    return mdEditor;
}

function addToolicons(config) {
    const mdpress = window.mdpress;
    const className = "majoricon";
    const icons = [
        { icon: "icon-zhankaicaidan", title: "打开左侧侧边栏", className: className, position: "right" },
        { icon: "icon-file-markdown1", title: "导入markdown", className: className },
        { icon: "icon-fujian1", title: "托管附件", className: className, position: "right" },
        { icon: "icon-baocun1", title: "保存文档", className: className, position: "right" }
    ].map(opts => new mdpress.ToolIcon(opts));

    icons.forEach(icon => icon.addTo(getEditor()));

    const LEFT_NAV_FLOAT = "left-nav-float";
    const ANIMATION_FADEINLEFT = "animate__fadeInLeft";

    icons[0].on("click", function() {
        if (getEditor().isFullScreen()) {
            const leftNav = config.getLeftNav ? config.getLeftNav() : null;
            if (leftNav) {
                const classList = leftNav.classList;
                if (classList.contains(LEFT_NAV_FLOAT)) {
                    classList.remove(LEFT_NAV_FLOAT);
                    classList.remove(ANIMATION_FADEINLEFT);
                } else {
                    classList.add(LEFT_NAV_FLOAT);
                    classList.add(ANIMATION_FADEINLEFT);
                }
            }
        } else {
            if (config.info) config.info("当编辑器全屏时才可以进行该操作");
        }
    });

    icons[1].on("click", () => { if (config.importMd) config.importMd() });
    icons[2].on("click", () => { if (config.openUploadPanel) config.openUploadPanel() });
    icons[3].on("click", () => { if (config.saveDoc) config.saveDoc() });
}
