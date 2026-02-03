<template>
  <div class="main">
    <div class="header">
      <div class="container flex">
        <div class="logo item">
          <router-link to="/">mdpress</router-link>
        </div>
        <div class="menu flex">
          <div class="item">
            <router-link to="/projects">项目</router-link>
          </div>
          <!-- <div class="item">
            <a href="https://mdpress.glicon.design/problem.html">常见问题</a>
          </div>
          <div class="item">
            <a href="https://mdpress.glicon.design/about.html">关于</a>
          </div> -->
        </div>
        <div class="users flex">
          <div class="item green">
            <router-link to="/user"><i class="iconfont icon-ziyuanxhdpi"></i></router-link>
          </div>
        </div>
      </div>
    </div>
    <div class="home">
      <div class="container">
        <div class="hero">
          <h2>在线版的VitePress</h2>
          <h6>线上直接编译,体验原汁原味的VitePress</h6>
        </div>
      </div>
      <div class="container">
        <router-link to="/projects" class="btn btn-white">
          <i aria-hidden="true" class="iconfont icon-xiangmu"></i><span>新建项目</span>
        </router-link>
      </div>
    </div>
    <div class="blank"></div>
    <div class="container features flex">
      <div class="col-md-3 col-sm-6 res-margin item">
        <div class="icon icon-bg-md grdnt-purple center">
          <i class="iconfont icon-file-markdown"></i>
        </div>
        <div class="text center">
          <h2>markdown</h2>
          <p>线上直接编辑你的markdown.</p>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 res-margin item">
        <div class="icon icon-bg-md grdnt-purple center">
          <i class="iconfont icon-jishu"></i>
        </div>
        <div class="text center">
          <h2>一键编译</h2>
          <p>线上一键就可以编译你的项目.</p>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 item">
        <div class="icon icon-bg-md grdnt-purple center">
          <i class="iconfont icon-renren"></i>
        </div>
        <div class="text center">
          <h2>多人协作</h2>
          <p>可以邀请好友或者同事来一起来快乐的写文档.</p>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 item">
        <div class="icon icon-bg-md grdnt-purple center">
          <i class="iconfont icon-vitejs"></i>
        </div>
        <div class="text center">
          <h2>原味的VitePress</h2>
          <p>将你的项目文档生成VitePress并自动托管.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Logic can be added here if needed
</script>

<style scoped>
/* Copied and adapted from public/index-3018ea7565.css */
a {
  color: rgba(60, 60, 67);
  text-decoration: none;
}

.home {
  margin-top: -60px;
  padding-top: 100px;
  height: 400px;
  background: #10b98117;
  /* background-image: url(../img/bg2.png);  -- Assuming image might be missing or needs correct path */
  background-size: cover;
}

.hero {
  width: 50%;
  margin-top: 80px;
  font-size: 1.75em;
}

.btn {
  display: inline-block;
  text-align: center;
  position: relative;
  text-transform: uppercase;
  border-radius: 70px;
  color: #fff;
  padding: 8px 28px;
  background: 0 0;
  font-family: "open sans";
  font-size: .9em;
  transition: .5s;
  -webkit-transition: .5s;
  border: 0;
  margin-top: 5px;
  margin-right: 10px;
  min-width: 100px;
}

.btn-white {
  background-color: #fff;
  border: 1px solid #fff;
  color: #10b981;
  text-decoration: none;
}

.btn-white span {
  margin-left: 10px;
  font-size: 16px;
}

.blank {
  height: 60px;
}

.features {
  color: #10b98182;
}

.features .item {
  padding: 10px;
  width: 20%;
  height: 300px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  margin: 20px;
  border: 1px solid #efefef;
}

.features .item:hover {
  box-shadow: 0 0 68px rgba(0, 0, 0, .2);
}

.features .item .icon {
  font-size: 1.5em;
  border-radius: 50%;
  text-align: center;
  line-height: 120px;
}

.features .item .icon .iconfont {
  font-size: 80px;
}

.features .item .text {
  color: #000;
}

/* Header styles copied from Projects.vue reference or similar */
.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  height: 60px;
  line-height: 60px;
  position: relative;
  z-index: 10;
}

.container {
  width: 1200px;
  margin: 0 auto;
}

.flex {
  display: flex;
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

.header .menu .item a:hover {
  color: #10b981;
}

/* Utility classes that might be missing if scoped */
.center {
  text-align: center;
}
</style>