import { createRouter, createWebHashHistory } from 'vue-router'
import Editor from '../views/Editor.vue'
import Projects from '../views/Projects.vue'
import Home from '../views/Home.vue'
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
    name: 'Home',
    component: Home
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects
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
