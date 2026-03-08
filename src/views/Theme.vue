<template>
  <div class="main">
    <Header />
    <div class="content-container news-container" id="theme-container">
      <div class="container news">
        <div class="context">
          这里是主题页面，您可以在这里浏览和切换不同的主题风格。
        </div>
      </div>
      <div class="container news">
        <div class="context">主题功能介绍</div>
        <ul>
          <li>提供多种预设主题供选择</li>
          <li>支持自定义配色方案</li>
          <li>适配不同的阅读场景和设备</li>
          <li>持续更新更多精美主题</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
// Logic can be added here if needed
</script>

<style scoped>
.container {
  width: 80%;
  margin: auto;
}
/* Copied and adapted from public/index-3018ea7565.css */
.news {
  padding: 10px;
  border-bottom: 1px solid #f3f3f3;
}

.home {
  margin-top: -60px;
  padding-top: 100px;
  height: 400px;
  background: #10b98117;
  /* background-image: url(../img/bg2.png);  -- Assuming image might be missing or needs correct path */
  background-size: cover;
}
</style>
<script>


</script>

