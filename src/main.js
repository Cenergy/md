import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

// Global Styles from npm packages
import 'highlight.js/styles/atom-one-dark.css'
import 'katex/dist/katex.min.css'
import 'swiper/css'
import 'viewerjs/dist/viewer.css'
import 'x-data-spreadsheet/dist/xspreadsheet.css'

// Local Styles
import '@/assets/css/font_3975977_isscicrrga.css'
import '@/assets/css/base-4d592b08fc.css'
import '@/assets/css/edit-65440efa85.css'
import '@/assets/css/editor.css'
import '@/assets/css/message.css'

// Libraries
import hljs from 'highlight.js'
import mermaid from 'mermaid'
import flowchart from 'flowchart.js'
import QRCode from 'qrcode'
import Swiper from 'swiper'
import * as XLSX from 'xlsx'
import Spreadsheet from 'x-data-spreadsheet'
import Raphael from 'raphael'

// Expose libraries to window for legacy support
window.hljs = hljs
window.mermaid = mermaid
window.flowchart = flowchart
window.QRCode = QRCode
window.Swiper = Swiper
window.XLSX = XLSX
window.x_spreadsheet = Spreadsheet
window.Raphael = Raphael

// Import Legacy Scripts
// Note: These scripts likely rely on the globals exposed above
import '@/utils/legacy.js'
import '@/utils/prettier-loader.js'
import '@/lib/domclickoutside.min.js'
import '@/lib/mdpress-editor.min.js'
import '@/lib/mdeditorplugins.js'
import '@/lib/filednd.min.js'

const app = createApp(App)

app.use(ElementPlus)
app.mount('#app')
