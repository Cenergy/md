import { ref, watch } from 'vue'

const THEME_KEY = 'app-theme'

const isDark = ref(false)

function applyTheme(dark) {
  const html = document.documentElement
  if (dark) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
  isDark.value = dark
}

function getStoredTheme() {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'dark') return true
  if (stored === 'light') return false
  // 默认深色模式
  return true
}

function initTheme() {
  const dark = getStoredTheme()
  applyTheme(dark)
}

function toggleTheme() {
  const newDark = !isDark.value
  applyTheme(newDark)
  localStorage.setItem(THEME_KEY, newDark ? 'dark' : 'light')
}

function setTheme(dark) {
  applyTheme(dark)
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
}

export function useTheme() {
  return {
    isDark,
    initTheme,
    toggleTheme,
    setTheme,
  }
}
