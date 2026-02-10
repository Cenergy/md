import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

// Local Styles
import '@/assets/css/font_3975977_isscicrrga.css'
import '@/assets/css/base.css'
import '@/assets/css/edit.css'
import '@/assets/css/editor.css'
import '@/assets/css/message.css'

const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.mount('#app')
