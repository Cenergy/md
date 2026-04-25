<template>
  <div class="main">
    <Header />
    <div class="content-container news-container">
      <div class="container news">
        <div class="context">
          使用过程遇到问题或者有好的需求建议请在这里提交<a
            target="_blank"
            href="https://github.com/deyihu/mdpress/issues"
            class="green"
            >mdpress issue</a
          >
        </div>
        <div class="context">
          或者发送邮件到<a href="mailto:mehudeyi@163.com" class="green"
            >mehudeyi@163.com</a
          >
        </div>
      </div>
      <div class="container news">
        <div class="context">mdpress的特点和应用场景</div>
        <ul>
          <li>在线写文档,即写即存</li>
          <li>多人协作共同完成一个比较复杂的任务</li>
          <li>
            省去安装前端的各种脚手架工具和各种代码同步,编译和发布等,不是所有的技术人员都是前端人员的,对于一些非前端人员一个浏览器就够了
          </li>
          <li>尤其适合文档不的不断完善和维护和快速更新等场景</li>
          <li>
            如果是首次写你的项目文档,mdpress的效率是没有直接在vscode等工具里快的,但是后续的不断完善和修改等就非常适合mdpress了
          </li>
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
