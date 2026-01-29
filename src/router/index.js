import { createRouter, createWebHashHistory } from 'vue-router'
import Editor from '../views/Editor.vue'
import Projects from '../views/Projects.vue'

const routes = [
  {
    path: '/editor',
    name: 'Editor',
    component: Editor
  },
  {
    path: '/',
    name: 'Projects',
    component: Projects
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
