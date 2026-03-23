<script setup>
import DefaultTheme from 'vitepress/theme'
import { onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import Twikoo from './Twikoo.vue'

const { Layout } = DefaultTheme
const route = useRoute()
const twikooEnvId = __TWIKOO_ENV_ID__
const enableTwikoo = twikooEnvId !== ''
let observer

const initTheme = () => {
  nextTick(() => {
    const doc = document.querySelector('#VPContent')
    if (doc && !doc.classList.contains('markdown-body')) {
      doc.classList.add('markdown-body')
    }
  })
}

onMounted(() => {
  initTheme()
  observer = new MutationObserver(() => {
    initTheme()
  })
  observer.observe(document.body, { childList: true, subtree: true })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

watch(
  () => route.path,
  () => {
    initTheme()
  }
)
</script>

<template>
  <Layout>
    <template #doc-after>
      <Twikoo v-if="enableTwikoo" :env-id="twikooEnvId" />
    </template>
  </Layout>
</template>
