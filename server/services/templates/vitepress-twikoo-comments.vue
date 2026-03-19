<script setup>
import { nextTick, watch } from 'vue'

const props = defineProps({
  envId: {
    type: String,
    default: ''
  },
  path: {
    type: String,
    default: '/'
  }
})

const twikooScriptSrc = 'https://registry.npmmirror.com/twikoo/1.7.3/files/dist/twikoo.min.js'
const isClient = typeof window !== 'undefined' && typeof document !== 'undefined'
let twikooScriptPromise

const ensureTwikooScript = () => {
  if (window.twikoo) {
    return Promise.resolve(window.twikoo)
  }
  if (twikooScriptPromise) {
    return twikooScriptPromise
  }
  twikooScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-twikoo]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.twikoo), { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = twikooScriptSrc
    script.async = true
    script.dataset.twikoo = 'true'
    script.onload = () => resolve(window.twikoo)
    script.onerror = reject
    document.head.appendChild(script)
  })
  return twikooScriptPromise
}

const initTwikoo = async () => {
  if (!isClient) {
    return
  }
  if (!props.envId) {
    return
  }
  await nextTick()
  const container = document.getElementById('twikoo-container')
  if (!container) {
    return
  }
  container.innerHTML = ''
  const twikoo = await ensureTwikooScript()
  if (!twikoo) {
    return
  }
  twikoo.init({
    envId: props.envId,
    el: '#twikoo-container',
    path: props.path
  })
}

watch(
  () => [props.envId, props.path],
  () => {
    initTwikoo()
  },
  { immediate: true, flush: 'post' }
)
</script>

<template>
  <div id="twikoo-container"></div>
</template>
