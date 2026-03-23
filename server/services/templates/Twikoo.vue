<script setup>
import { nextTick, onMounted, watch, ref } from 'vue'
import { useRoute } from 'vitepress'

const props = defineProps({
  envId: {
    type: String,
    default: ''
  },
})

const route = useRoute()
const isClient = typeof window !== 'undefined' && typeof document !== 'undefined'
const containerRef = ref(null)

const resolveTwikooClient = async () => {
  const mod = await import('twikoo')
  if (mod && typeof mod.init === 'function') {
    return mod
  }
  if (mod && mod.default && typeof mod.default.init === 'function') {
    return mod.default
  }
  return null
}

const initTwikoo = async () => {
  if (!isClient) {
    return
  }
  if (!props.envId) {
    return
  }
  await nextTick()
  if (!containerRef.value) {
    return
  }
  
  // 清空容器内容，防止之前的评论组件残留
  containerRef.value.innerHTML = '<div id="twikoo-container"></div>'
  
  const twikoo = await resolveTwikooClient()
  if (!twikoo) {
    return
  }
  twikoo.init({
    envId: props.envId,
    el: '#twikoo-container',
    path: route.path
  })
}

onMounted(() => {
  initTwikoo()
})

watch(
  () => route.path,
  () => {
    initTwikoo()
  }
)
</script>

<template>
  <div class="twikoo-wrapper" ref="containerRef">
    <div id="twikoo-container"></div>
  </div>
</template>
