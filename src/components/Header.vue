<template>
  <div class="header" v-show="show">
    <div class="container flex">
      <div class="logo item">
        <router-link to="/">mdpress</router-link>
      </div>
      
      <!-- Desktop Menu -->
      <div class="menu flex desktop-menu">
        <div class="item"><router-link to="/start"><i class="iconfont icon-jiaocheng"></i> 教程</router-link></div>
        <div class="item"><router-link to="/projects"><i class="iconfont icon-xiangmu"></i> 项目</router-link></div>
        <div class="item"><router-link to="/theme"><i class="iconfont icon-xiugai"></i> 主题</router-link></div>
        <div class="item"><router-link to="/problem"><i class="iconfont icon-gonggao"></i> 常见问题</router-link></div>
        <div class="item"><router-link to="/about"><i class="iconfont icon-renren"></i> 关于</router-link></div>
      </div>
      
      <div class="users flex">
        <div class="item green"><router-link to="/user"><i class="iconfont icon-ziyuanxhdpi"></i></router-link></div>
      </div>

      <!-- Mobile Menu Toggle -->
      <div class="mobile-toggle" @click="toggleMenu">
        <svg v-if="!isMenuOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <transition name="slide-fade">
      <div class="mobile-menu" v-if="isMenuOpen">
        <div class="item" @click="closeMenu"><router-link to="/start"><i class="iconfont icon-jiaocheng"></i> 教程</router-link></div>
        <div class="item" @click="closeMenu"><router-link to="/projects"><i class="iconfont icon-xiangmu"></i> 项目</router-link></div>
        <div class="item" @click="closeMenu"><router-link to="/theme"><i class="iconfont icon-xiugai"></i> 主题</router-link></div>
        <div class="item" @click="closeMenu"><router-link to="/problem"><i class="iconfont icon-gonggao"></i> 常见问题</router-link></div>
        <div class="item" @click="closeMenu"><router-link to="/about"><i class="iconfont icon-renren"></i> 关于</router-link></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  show: {
    type: Boolean,
    default: true
  }
})

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<style scoped>
.header {
  background: #fff;
  box-shadow: var(--box-shadow);
  height: 60px;
  line-height: 60px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.flex {
  display: flex;
  align-items: center;
}

.header .logo {
  margin-right: 40px;
  flex-shrink: 0;
}

.header .logo a {
  font-size: 24px;
  color: var(--text-color);
  text-decoration: none;
  font-weight: bold;
  background-image: linear-gradient(to right, var(--primary-color) 0, #141414 100%);
  -webkit-background-clip: text;
  -moz-background-clip: text;
  background-clip: text;
  color: transparent;
}

.header .menu {
  flex: 1;
  display: flex;
  justify-content: flex-start;
}

.header .menu .item {
  margin: 0 15px;
}

.header .menu .item a {
  color: var(--secondary-color);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s;
}

.header .menu .item a:hover,
.header .menu .item a.router-link-active {
  color: var(--primary-color);
}

.header .menu .item i {
  margin-right: 4px;
  font-size: 18px;
  vertical-align: -2px;
}

.users .item {
  margin-left: 20px;
  cursor: pointer;
}

.users .item.green {
  color: var(--primary-color);
}

.users .item i {
  font-size: 20px;
}

/* Mobile Toggle */
.mobile-toggle {
  display: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-color);
  margin-left: 20px;
}

/* Mobile Menu Styles */
.mobile-menu {
  position: absolute;
  top: 60px;
  left: 0;
  width: 100%;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  display: flex;
  flex-direction: column;
}

.mobile-menu .item {
  padding: 10px 20px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-menu .item:last-child {
  border-bottom: none;
}

.mobile-menu .item a {
  color: var(--text-color);
  font-size: 16px;
  display: block;
  width: 100%;
}

.mobile-menu .item a:hover,
.mobile-menu .item a.router-link-active {
  color: var(--primary-color);
}

.mobile-menu .item i {
  margin-right: 8px;
  font-size: 18px;
  vertical-align: -2px;
}

/* Transition for mobile menu */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

@media (max-width: 768px) {
  .header .desktop-menu {
    display: none;
  }
  
  .users {
    margin-left: auto;
  }
  
  .mobile-toggle {
    display: block;
  }
  
  .header .logo {
    margin-right: 0;
  }
}
</style>
