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

// 等待全局变量可用
const waitForGlobal = (name, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const check = () => {
      if (window[name]) {
        resolve(window[name])
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`${name} not loaded within timeout`))
      } else {
        setTimeout(check, 100)
      }
    }
    check()
  })
}

// 初始化 Mermaid
const initMermaid = async () => {
  const mermaidContainers = document.querySelectorAll('.mermaid-container')
  if (mermaidContainers.length === 0) return
  
  try {
    const mermaid = await waitForGlobal('mermaid')
    mermaid.initialize({ 
      startOnLoad: false, 
      theme: 'default',
      securityLevel: 'loose'
    })
    
    mermaidContainers.forEach((container) => {
      const sourceEl = container.querySelector('.source')
      if (sourceEl) {
        const code = sourceEl.textContent.trim()
        const diagramEl = document.createElement('div')
        diagramEl.className = 'mermaid'
        diagramEl.textContent = code
        container.appendChild(diagramEl)
        sourceEl.remove()
      }
    })
    
    mermaid.run()
  } catch (e) {
    console.error('Mermaid init error:', e)
  }
}

// 初始化 Flowchart
const initFlowchart = async () => {
  const flowchartContainers = document.querySelectorAll('.flowchart-container')
  if (flowchartContainers.length === 0) return
  
  try {
    // 确保 Raphael 和 flowchart 都已加载
    await waitForGlobal('Raphael')
    const flowchart = await waitForGlobal('flowchart')
    
    flowchartContainers.forEach((container) => {
      const sourceEl = container.querySelector('.source')
      if (sourceEl) {
        const code = sourceEl.textContent.trim()
        try {
          const diagram = flowchart.parse(code)
          const diagramEl = document.createElement('div')
          diagramEl.className = 'flowchart-diagram'
          container.appendChild(diagramEl)
          sourceEl.remove()
          diagram.drawSVG(diagramEl)
        } catch (e) {
          console.error('Flowchart parse error:', e)
          container.innerHTML = `<pre class="error">Flowchart Error: ${e.message}</pre>`
        }
      }
    })
  } catch (e) {
    console.error('Flowchart init error:', e)
  }
}

// 初始化 KaTeX
const initKatex = async () => {
  const katexContainers = document.querySelectorAll('.katex-container')
  if (katexContainers.length === 0) return
  
  try {
    const katex = await waitForGlobal('katex')
    
    katexContainers.forEach((container) => {
      const sourceEl = container.querySelector('.source')
      if (sourceEl) {
        const code = sourceEl.textContent.trim()
        try {
          const diagramEl = document.createElement('div')
          diagramEl.className = 'katex-display'
          container.appendChild(diagramEl)
          sourceEl.remove()
          katex.render(code, diagramEl, {
            displayMode: true,
            throwOnError: false
          })
        } catch (e) {
          console.error('KaTeX render error:', e)
        }
      }
    })
  } catch (e) {
    console.error('KaTeX init error:', e)
  }
}

// 初始化 PlantUML
const initPlantUML = async () => {
  const codeBlocks = document.querySelectorAll('pre code')
  
  try {
    // plantuml-encoder 暴露的全局变量名
    const plantuml = await waitForGlobal('plantumlEncoder')
    
    for (const block of codeBlocks) {
      const code = block.textContent
      if (code && code.includes('@startuml')) {
        try {
          const encoded = plantuml.encode(code)
          const pre = block.parentElement
          const img = document.createElement('img')
          img.src = `https://www.plantuml.com/plantuml/svg/${encoded}`
          img.alt = 'PlantUML Diagram'
          img.style.maxWidth = '100%'
          const wrapper = document.createElement('div')
          wrapper.className = 'plantuml-diagram'
          wrapper.appendChild(img)
          pre.replaceWith(wrapper)
        } catch (e) {
          console.error('PlantUML render error:', e)
        }
      }
    }
  } catch (e) {
    console.error('PlantUML init error:', e)
  }
}

// 等待第三方脚本加载完成
const waitForThirdPartyScripts = (timeout = 10000) => {
  return new Promise((resolve) => {
    if (window.__thirdPartyScriptsReady) {
      resolve()
      return
    }
    const timer = setTimeout(() => resolve(), timeout)
    window.addEventListener('thirdPartyScriptsReady', () => {
      clearTimeout(timer)
      resolve()
    }, { once: true })
  })
}

const initAllPlugins = async () => {
  await nextTick()
  // 等待 CDN 脚本加载完成
  await waitForThirdPartyScripts()
  await Promise.all([
    initMermaid(),
    initFlowchart(),
    initKatex(),
    initPlantUML()
  ])
}

onMounted(async () => {
  initTheme()
  await initAllPlugins()
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
  async () => {
    initTheme()
    await initAllPlugins()
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

<style>
/* Flowchart 样式 */
.flowchart-diagram {
  overflow-x: auto;
  padding: 16px 0;
}
.flowchart-diagram svg {
  max-width: 100%;
  height: auto;
}

/* Mermaid 样式 */
.mermaid-container .mermaid {
  padding: 16px 0;
}

/* KaTeX 样式 */
.katex-display {
  padding: 16px 0;
  overflow-x: auto;
}

/* PlantUML 样式 */
.plantuml-diagram {
  padding: 16px 0;
  text-align: center;
}
.plantuml-diagram img {
  max-width: 100%;
  height: auto;
}

/* 错误提示 */
pre.error {
  color: #e53935;
  background: #ffebee;
  padding: 12px;
  border-radius: 4px;
}
</style>
