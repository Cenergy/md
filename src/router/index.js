import { createRouter, createWebHashHistory } from 'vue-router'
import Editor from '../views/Editor.vue'
import Projects from '../views/Projects.vue'
import User from '../views/User.vue'
import Login from '../views/Login.vue'

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
  },
  {
    path: '/projects',
    redirect: '/'
  },
  {
    path: '/user',
    name: 'User',
    component: User
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
] 

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
