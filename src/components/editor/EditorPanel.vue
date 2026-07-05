<template>
  <div class="right-nav" ref="panelRef">
    <div class="tools">
      <el-button size="mini" @click="$emit('import')">导入Markdown</el-button>
      <el-button size="mini" @click="$emit('open-upload')">托管附件</el-button>
      <el-button size="mini" @click="$emit('save')">保存文档</el-button>
    </div>
    <div class="edit-container flex" style="flex: 1; overflow: hidden">
      <div class="edit-panel flex" style="flex: 1; height: 100%">
        <div class="editor panel" v-show="editorVisible" style="height: 100%; width: 100%">
          <MdEditor
            ref="editorRef"
            v-model="editorText"
            :theme="darkMode ? 'dark' : 'light'"
            previewTheme="default"
            codeTheme="atom-one"
            :toolbars="toolbars"
            :footers="footers"
            :on-upload-img="handleUploadImg"
            :preview-only="false"
            :no-mermaid="false"
            :no-katex="false"
            :no-prettier="false"
            :show-code-row-number="true"
            :scroll-auto="true"
            style="height: 100%"
            @on-save="onSave"
            @on-change="onChange"
          />
        </div>
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
import { ref, onMounted, watch, shallowRef } from 'vue';
import { MdEditor, allToolbar, allFooter } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { useTheme } from '@/composables/useTheme';

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
const editorRef = shallowRef(null);
const editorText = ref('');
const isSettingValue = ref(false);

// 暗黑模式（md-editor-v3 只支持 light/dark 两种基础主题）
const { isDark } = useTheme();

const toolbars = allToolbar;
const footers = allFooter;

const handleUploadImg = async (files, callback) => {
  if (!props.uploadFile) {
    callback([]);
    return;
  }
  const urls = [];
  for (const file of files) {
    if (file.size > 20 * 1024 * 1024) {
      if (props.warn) props.warn(`文件 ${file.name} 超过 20M，跳过上传`);
      continue;
    }
    const url = await new Promise((resolve) => {
      props.uploadFile(file, (u) => resolve(u));
    });
    if (url) urls.push(url);
  }
  callback(urls);
};

const onSave = () => {
  // MdEditor 自带保存按钮（Ctrl+S / 工具栏保存）触发
  if (props.saveDoc) props.saveDoc();
};

const onChange = () => {
  if (!isSettingValue.value) {
    emit('content-change');
  }
};

watch(editorText, () => {
  if (!isSettingValue.value) {
    emit('content-change');
  }
});

// 暴露给父组件的方法（保持与旧 API 兼容）
const setValue = (value) => {
  isSettingValue.value = true;
  editorText.value = value ?? '';
  // 下一帧释放，避免触发 content-change
  requestAnimationFrame(() => {
    isSettingValue.value = false;
  });
};

const getValue = () => {
  return editorText.value;
};

const setTheme = (_theme) => {
  // 旧版本主题名（如 serene-rose）无法直接映射到 md-editor-v3
  // md-editor-v3 主题由 light/dark 控制，预览主题由 previewTheme 控制
  // 这里保留接口兼容，实际主题切换由 darkMode 控制
};

// 父组件可能通过 ref 获取编辑器实例做高级操作
const getEditorInstance = () => editorRef.value;

onMounted(() => {
  emit('editor-ready');
});

defineExpose({
  setValue,
  getValue,
  setTheme,
  getEditor: getEditorInstance,
  getElement: () => panelRef.value
});
</script>

<style>
/* Styles are defined in global CSS: src/assets/css/edit.css */
</style>
