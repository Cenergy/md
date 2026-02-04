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
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/start',
    name: 'Start',
    component: () => import('../views/Start.vue')
  }
] 

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
