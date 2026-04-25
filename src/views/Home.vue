<template>
  <div class="main">
    <Header />
    <div class="home">
      <div class="container hero-container">
        <div class="hero">
          <h2>在线版的VitePress</h2>
          <h6>线上直接编译,体验原汁原味的VitePress</h6>
          <router-link to="/projects" class="btn btn-white">
            <i aria-hidden="true" class="iconfont icon-xiangmu"></i><span>新建项目</span>
          </router-link>
        </div>
      </div>
    </div>
    
    <div class="features-section">
      <div class="container features">
        <div class="item">
          <div class="icon-wrapper">
            <i class="iconfont icon-file-markdown"></i>
          </div>
          <div class="text">
            <h2>Markdown</h2>
            <p>线上直接编辑你的 Markdown。</p>
          </div>
        </div>
        <div class="item">
          <div class="icon-wrapper">
            <i class="iconfont icon-jishu"></i>
          </div>
          <div class="text">
            <h2>一键编译</h2>
            <p>线上一键就可以编译你的项目。</p>
          </div>
        </div>
        <div class="item">
          <div class="icon-wrapper">
            <i class="iconfont icon-renren"></i>
          </div>
          <div class="text">
            <h2>多人协作</h2>
            <p>可以邀请好友或者同事来一起来快乐的写文档。</p>
          </div>
        </div>
        <div class="item">
          <div class="icon-wrapper">
            <i class="iconfont icon-vitejs"></i>
          </div>
          <div class="text">
            <h2>原味 VitePress</h2>
            <p>将你的项目文档生成 VitePress 并自动托管。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
</script>

<style scoped>
.main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.home {
  padding-top: 60px; /* Space for fixed header */
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.05) 0%, rgba(224, 242, 254, 0.5) 100%);
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

html.dark .home {
  background: linear-gradient(135deg, rgba(64, 169, 255, 0.08) 0%, rgba(29, 30, 34, 0.8) 100%);
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
}

.hero h2 {
  font-size: 3em;
  margin-bottom: 10px;
  color: var(--text-color);
  font-weight: 700;
}

.hero h6 {
  font-size: 1.5em;
  color: var(--secondary-color);
  margin-bottom: 30px;
  font-weight: 400;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  padding: 12px 32px;
  font-size: 1.1em;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
}

.btn-white {
  background-color: var(--primary-color);
  color: white;
  border: 2px solid var(--primary-color);
  box-shadow: 0 4px 6px -1px rgba(24, 144, 255, 0.3);
}

.btn-white:hover {
  background-color: var(--primary-color);
  filter: brightness(1.1);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 6px 10px -1px rgba(24, 144, 255, 0.4);
}

.btn-white span {
  margin-left: 8px;
}

.features-section {
  padding: 80px 0;
  background-color: var(--card-bg);
}

.features {
  display: grid;
  gap: 40px;
  /* Default to multi-column for larger screens */
  grid-template-columns: repeat(4, 1fr);
}

.features .item {
  padding: 30px;
  border-radius: 16px;
  background: var(--card-bg);
  box-shadow: var(--box-shadow);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid var(--border-color);
}

.features .item:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(24, 144, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: var(--primary-color);
}

html.dark .icon-wrapper {
  background: rgba(64, 169, 255, 0.15);
}

.features .item .iconfont {
  font-size: 40px;
}

.features .text h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
  color: var(--text-color);
}

.features .text p {
  color: var(--secondary-color);
  line-height: 1.6;
}

/* Responsive Breakpoints */
@media (max-width: 1200px) {
  .features {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero h2 {
    font-size: 2em;
  }
  .hero h6 {
    font-size: 1.2em;
  }
  
  .features {
    grid-template-columns: 1fr; /* Single column for mobile */
  }
  
  .features-section {
    padding: 40px 0;
  }
}
</style>