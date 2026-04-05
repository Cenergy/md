import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/editor',
    name: 'Editor',
    component: () => import('../views/Editor.vue')
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../views/Projects.vue')
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('../views/User.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/problem',
    name: 'Problem',
    component: () => import('../views/Problem.vue')
  },
  {
    path: '/theme',
    name: 'Theme',
    component: () => import('../views/Theme.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/start',
    name: 'Start',
    component: () => import('../views/Start.vue')
  },
  {
    path: '/hello',
    name: 'Hello',
    component: () => import('../views/Hello.vue')
  },
  {
    path: '/mobile/:sessionId',
    name: 'MobileChat',
    component: () => import('../views/MobileChat.vue')
  }
] 

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
