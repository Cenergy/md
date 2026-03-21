<template>
  <div class="right-nav" ref="panelRef">
    <div class="tools">
      <el-button size="mini" @click="$emit('import')">导入Markdown</el-button>
      <el-button size="mini" @click="$emit('open-upload')">托管附件</el-button>
      <el-button size="mini" @click="$emit('save')">保存文档</el-button>
    </div>
    <div class="edit-container flex" style="flex: 1; overflow: hidden">
      <div class="edit-panel flex" style="flex: 1; height: 100%">
        <div id="editor" ref="editorContainer" class="editor panel" v-show="editorVisible"></div>
        <div class="editor-desc panel" v-show="!editorVisible">
          点击左侧的列表项进行文档编辑
        </div>
      </div>
      <div
        class="menuurls"
        v-show="!hideLinksPanel"
        style="width: 260px; flex-shrink: 0"
      >
        <div class="menuurls-header">
          <i class="iconfont icon-link"></i> 相对目录参考
        </div>
        <div class="menuurls-list">
          <div class="row" v-for="url in sliderURLS" :key="url.url">
            <div class="url-label" :title="url.url">{{ url.label }}</div>
            <el-button type="primary" link size="small" @click="$emit('copy', url.url)">复制</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { createEditor, getEditor, destroyEditor } from '@/utils/editor';
import { loadEditorPlugins } from '@/utils/lazy-loader';

const props = defineProps({
  editorVisible: {
    type: Boolean,
    default: false
  },
  hideLinksPanel: {
    type: Boolean,
    default: true
  },
  sliderURLS: {
    type: Array,
    default: () => []
  },
  theme: {
    type: String,
    default: 'serene-rose'
  },
  uploadFile: {
    type: Function,
    default: null
  },
  saveDoc: {
    type: Function,
    default: null
  },
  importMd: {
    type: Function,
    default: null
  },
  openUploadPanel: {
    type: Function,
    default: null
  },
  getLeftNav: {
    type: Function,
    default: null
  },
  warn: {
    type: Function,
    default: () => {}
  },
  info: {
    type: Function,
    default: () => {}
  }
});

const emit = defineEmits(['import', 'open-upload', 'save', 'copy', 'editor-ready', 'content-change']);

const panelRef = ref(null);
const editorContainer = ref(null);
let isSettingValue = false;
let editorInitialized = false;

const initEditor = async () => {
  if (!editorContainer.value || editorInitialized) return;
  
  await loadEditorPlugins();
  
  createEditor(editorContainer.value, {
    theme: props.theme,
    warn: props.warn,
    info: props.info,
    uploadFile: props.uploadFile,
    saveDoc: props.saveDoc,
    importMd: props.importMd,
    openUploadPanel: props.openUploadPanel,
    getLeftNav: props.getLeftNav
  }, () => {
    const editor = getEditor();
    if (editor) {
      editor.editor.onDidChangeModelContent(() => {
        if (!isSettingValue) {
          emit('content-change');
        }
      });
      editorInitialized = true;
      emit('editor-ready');
    }
  });
};

const setValue = (value) => {
  const editor = getEditor();
  if (editor) {
    isSettingValue = true;
    editor.setValue(value);
    isSettingValue = false;
  }
};

const getValue = () => {
  const editor = getEditor();
  return editor ? editor.getValue() : '';
};

const setTheme = (theme) => {
  const editor = getEditor();
  if (editor) {
    editor.setTheme(theme);
  }
};

watch(() => props.theme, (newTheme) => {
  setTheme(newTheme);
});

onMounted(() => {
  initEditor();
});

onBeforeUnmount(() => {
  destroyEditor();
  editorInitialized = false;
});

defineExpose({
  setValue,
  getValue,
  setTheme,
  getElement: () => panelRef.value
});
</script>

<style>
/* Styles are defined in global CSS: src/assets/css/edit.css */
</style>
