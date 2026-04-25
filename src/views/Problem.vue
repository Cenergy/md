<template>
  <div class="main">
    <Header />
    <div class="content-container news-container">
      <div class="container news">
        <div class="context">编译项目报错</div>
        <ul>
          <li>
            可能你的文档里包含了相对的资源链接,比如图片等,请把其换成绝对地址,或者在文档编辑页面里上传文件让我们托管
          </li>
          <li>...</li>
        </ul>
      </div>
      <div class="container news">
        <div class="context">编译好的项目某个页面会保存不能正常显示页面</div>
        <ul>
          <li>
            你的文档里可能包含{}这样的表达式,文档是采用<a
              href="https://vitepress.dev/"
              >vitepress</a
            >
            编译的,{}在vue语法里表示取值的,从当前上下文是找不到vue变量的
          </li>
          <li>...</li>
        </ul>
      </div>
      <div class="container news">
        <div class="context">markdown编辑时不能实时显示,表现在表格错乱等</div>
        <ul>
          <li>
            在里的markdown文档里最好不要使用非markdown语法外的元素,比如html的一些标签,markdown编辑器里不支持html标签的实时预览的
          </li>
          <li>
            但是编译后能正常显示是因为markdown最后会被编译为html页面,html元素标签在HTML规范下当然可以正常显示了
          </li>
          <li>...</li>
        </ul>
      </div>
      <div class="container news">
        <div class="context">支持vue和vue相关组件库吗?</div>
        <ul>
          <li>
            不支持,该站点是个纯的文档的站点,输入只能是markdown语法和一些原生的html元素
          </li>
          <li>
            如果你的文档里需要使用vue和vue各种生态库,那么你需要使用原生的VuePress/VitePress
          </li>
          <li>...</li>
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
    border-bottom: 1px solid var(--border-color);
}

.home {
    margin-top: -60px;
    padding-top: 100px;
    height: 400px;
    background: rgba(var(--primary-color-rgb), 0.08);
  /* background-image: url(../img/bg2.png);  -- Assuming image might be missing or needs correct path */
  background-size: cover;
}
</style>
