<template>
  <el-card
    class="project-card"
    :class="{ 'collaborate-card': mode === 'collaborator' }"
    :body-style="{ padding: '0px', display: 'flex', flexDirection: 'column', height: '100%' }"
  >
    <div class="project-header">
      <div class="project-title">
        <i class="iconfont icon-xiangmu"></i>
        <span>{{ project.name }}</span>
      </div>
      <div v-if="mode === 'owner'" class="project-index">#{{ index + 1 }}</div>
      <div v-else class="project-tag">协作</div>
    </div>

    <div class="project-body">
      <div class="action-grid" :class="{ 'is-owner': mode === 'owner', 'is-collaborator': mode !== 'owner' }">
        <div class="action-item action-item-secondary" @click="emit('profile', project)">
          <i class="iconfont icon-xiugai"></i>
          <span>设置</span>
        </div>
        <div class="action-item action-item-primary" @click="emit('docs', project)">
          <i class="iconfont icon-jiaocheng"></i>
          <span>创作</span>
        </div>
      </div>

      <div class="build-section">
        <el-button
          type="primary"
          class="build-btn"
          :loading="project.loading"
          @click="emit('build', project)"
          round
        >
          <i class="iconfont icon-vitejs" style="margin-right: 5px"></i> 编译发布
        </el-button>
      </div>
    </div>

    <div class="project-footer">
      <span class="project-id">ID: {{ project.id }}</span>
      <a :href="project.url" target="_blank" class="visit-link">
        浏览网站 <i class="iconfont icon-fuzhi1"></i>
      </a>
    </div>
  </el-card>
</template>

<script setup>
defineProps({
  project: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
  mode: {
    type: String,
    default: "owner",
  },
});

const emit = defineEmits(["profile", "docs", "build"]);
</script>

<style scoped>
.project-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: rgba(22, 93, 255, 0.2);
}

.project-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fafafa;
}

.project-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  margin-right: 12px;
}

.project-title span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-title .iconfont {
  margin-right: 8px;
  color: var(--primary-color);
  font-size: 20px;
  flex-shrink: 0;
}

.project-index {
  font-size: 14px;
  color: #999;
  font-family: monospace;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.project-tag {
  font-size: 12px;
  color: #fff;
  background: var(--success-color);
  padding: 2px 8px;
  border-radius: 4px;
}

.project-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.action-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.action-grid.is-owner {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.action-grid.is-collaborator {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--secondary-color);
  background: #f9f9f9;
}

.action-item:hover {
  background: #eef2ff;
  color: var(--primary-color);
}

.action-item-secondary {
  background: #f7f8fa;
  border: 1px solid #ebeef5;
  color: #606266;
}

.action-item-secondary:hover {
  background: #f2f3f5;
  border-color: #dcdfe6;
  color: #409eff;
}

.action-item-primary {
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.28);
  color: #2f76d2;
}

.action-item-primary:hover {
  background: rgba(64, 158, 255, 0.16);
  border-color: rgba(64, 158, 255, 0.4);
  color: #1f5fb8;
}

.action-item .iconfont {
  font-size: 24px;
  margin-bottom: 5px;
}

.action-item span {
  font-size: 12px;
}

.build-section {
  margin-top: auto;
}

.build-btn {
  width: 100%;
  height: 40px;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(64, 158, 255, 0.2);
}

.project-footer {
  padding: 12px 20px;
  border-top: 1px solid #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
  background: #fafafa;
}

.project-id {
  font-family: monospace;
}

.visit-link {
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: color 0.2s;
}

.visit-link:hover {
  color: var(--primary-color);
}

.visit-link .iconfont {
  margin-left: 4px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .action-grid {
    gap: 8px;
  }

  .project-body {
    padding: 16px;
  }

  .project-header {
    padding: 12px 16px;
  }
}
</style>
