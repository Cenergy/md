<template>
  <div class="header" v-show="show">
    <div class="container flex">
      <div class="logo item">
        <router-link to="/">mdpress</router-link>
      </div>
      <div class="menu flex">
        <div class="item"><router-link to="/start">教程</router-link></div>
        <div class="item"><router-link to="/projects">项目</router-link></div>
        <div class="item"><router-link to="/problem">常见问题</router-link></div>
        <div class="item"><router-link to="/about">关于</router-link></div>
      </div>
      <div class="users flex">
        <div class="item green"><router-link to="/user"><i class="iconfont icon-ziyuanxhdpi"></i></router-link></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  height: 60px;
  line-height: 60px;
}

.container {
  width: 1200px;
  margin: 0 auto;
}

.flex {
  display: flex;
}

.header .logo .item {
  margin-right: 40px;
}

.header .logo a {
  font-size: 24px;
  color: #333;
  text-decoration: none;
  font-weight: bold;
  margin-right: 40px;
}

.header .menu .item {
  margin: 0 20px;
}

.header .menu .item a {
  color: #666;
  text-decoration: none;
  font-size: 16px;
}

.header .menu .item a:hover,
.header .menu .item a.router-link-active {
  color: #10b981;
}

.users .item {
  margin-left: 20px;
  cursor: pointer;
}

.users .item.green {
  color: #10b981;
}

.users .item i {
  font-size: 20px;
}
</style>
