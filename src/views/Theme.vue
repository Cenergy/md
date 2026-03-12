<template>
   <div ref="editorContainer" style="width: 100%;height: 100%;"></div>
</template>

<script setup>
import Header from "@/components/Header.vue";
// Logic can be added here if needed
import { onMounted, ref } from 'vue';
import { MDEditor, setShikiPaths } from 'mdpress-monaco-editor';
import * as mdpress from 'mdpress-monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// npm install highlight.js katex viewerjs swiper x-data-spreadsheet mermaid flowchart.js xlsx raphael

import 'highlight.js/styles/atom-one-dark.min.css';
import 'katex/dist/katex.min.css';
import 'viewerjs/dist/viewer.min.css';
import 'swiper/css/bundle';
import 'x-data-spreadsheet/dist/xspreadsheet.css';
import 'mdpress-monaco-editor/dist/mdpress-monaco-editor.css';

const editorContainer = ref(null);
let mEditor;

// Monaco Environment Setup
const workers = {
    json: jsonWorker,
    css: cssWorker,
    scss: cssWorker,
    less: cssWorker,
    html: htmlWorker,
    handlebars: htmlWorker,
    razor: htmlWorker,
    typescript: tsWorker,
    javascript: tsWorker
};

self.MonacoEnvironment = {
    getWorker(_, label) {
        return new (workers[label] || editorWorker)();
    }
};

window.mdpress = mdpress;

const loadData = () => {
  fetch('/test/data.md').then(res => res.text()).then(text => {
    if (mEditor) {
      mEditor.setValue(text);
    }
  });
};

const customIcons = () => {
  const dom = document.createElement('div');
  dom.innerHTML = '自定义';
  dom.style.fontSize = '12px';
  dom.style.lineHeight = '24px';
  dom.style.cursor = 'pointer';
  dom.onclick = () => {
    alert('自定义图标');
  };
  if (mEditor) {
    mEditor.addToolIcon({
      dom,
      position: 'left',
      index: 0
    });
  }
};

onMounted(() => {
  if (editorContainer.value) {
    mEditor = new MDEditor(editorContainer.value, {
      theme: 'serene-rose',
      themeURL: 'http://localhost:3001/theme/',
      monacoOptions: {
        // language: 'markdown-math'
        // theme: 'vs-dark'
      }
    });
    loadData();
    customIcons();
  }
});
</script>


<style >
html, body, #app {
  height: 100%;
  width: 100%;
  margin: 0;
  font-family: 微软雅黑;
}

</style>

