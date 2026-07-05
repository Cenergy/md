<template>
   <div class="theme-page" style="width: 100%; height: 100%;">
     <MdPreview
       :modelValue="mdText"
       :theme="darkMode ? 'dark' : 'light'"
       previewTheme="default"
       codeTheme="atom-one"
       style="height: 100%"
     />
   </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import { useTheme } from '@/composables/useTheme';

const { isDark: darkMode } = useTheme();

const mdText = ref('');

const loadData = () => {
  fetch('/test/data.md')
    .then((res) => res.text())
    .then((text) => {
      mdText.value = text;
    })
    .catch((err) => {
      console.error('加载示例文档失败', err);
    });
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.theme-page {
  overflow: auto;
}
</style>
