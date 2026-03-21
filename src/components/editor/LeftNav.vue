<template>
  <div class="left-nav animate__animated" :class="{ collapsed: isCollapsed }" ref="leftNavRef">
    <div class="left-nav-header">
      <div class="nav-toggle" @click="toggleNav" :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'">
        <i class="iconfont" style="font-style: normal; font-size: 16px;" v-html="isCollapsed ? '&#10095;' : '&#10094;'"></i>
      </div>
      <el-button
        type="primary"
        size="mini"
        @click.stop="$emit('add-doc')"
        plain
        v-if="!isCollapsed"
        style="flex: 1; margin: 0 10px;"
      >
        <i class="iconfont icon-tianjia"></i> +文档
      </el-button>
    </div>
    <div class="nav-content">
      <div class="slider-content">
        <Container @drop="onSliderDrop" class="smooth-dnd-container vertical">
          <Draggable v-for="(slider, index) in sliders" :key="index">
            <div
              class="slider-item"
              :class="{ active: slider.isActive, group: slider.group }"
              @click="$emit('doc-click', slider)"
            >
              <div class="slider-header">
                <i class="column-drag-handle iconfont icon-tuozhuaicaidandaohang"></i>
                <button class="btn" @click.stop="$emit('edit-doc', slider)">
                  <i class="iconfont icon-xiugai"></i>
                </button>
                <span :class="{ label: slider.group }">{{ slider.name }}</span>
                <button
                  class="btn"
                  v-if="slider.group"
                  @click.stop="$emit('add-child-doc', slider)"
                  style="margin-left: 5px"
                >
                  <i class="iconfont icon-tianjia"></i>+
                </button>
              </div>
              <div v-if="slider.group" class="group-children">
                <Container
                  @drop="(e) => onSliderItemDrop(e, slider)"
                  :min-height="10"
                >
                  <Draggable
                    v-for="(child, cIndex) in slider.children || []"
                    :key="cIndex"
                  >
                    <div
                      class="slider-item child-item"
                      :class="{ active: child.isActive }"
                      @click.stop="$emit('doc-click', child)"
                    >
                      <div class="slider-header">
                        <i class="column-drag-handle iconfont icon-tuozhuaicaidandaohang"></i>
                        <button class="btn" @click.stop="$emit('edit-doc', child)">
                          <i class="iconfont icon-xiugai"></i>
                        </button>
                        <span>{{ child.name }}</span>
                      </div>
                    </div>
                  </Draggable>
                </Container>
              </div>
            </div>
          </Draggable>
        </Container>
      </div>
    </div>
    <div class="left-nav-footer">
      <div class="link-info" v-if="currentLink">
        <el-button type="text" size="mini" @click="$emit('copy', currentLink)" class="copy-btn" title="点击复制">
          <i class="iconfont icon-fuzhi1"></i>
        </el-button>
        <span class="link-text" :title="currentLink">{{ currentLink }}</span>
      </div>
      <div class="link-info empty" v-else>
        <span class="placeholder">暂无文档链接</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Container, Draggable } from 'vue3-smooth-dnd';

const props = defineProps({
  sliders: {
    type: Array,
    default: () => []
  },
  currentLink: {
    type: String,
    default: ''
  },
  collapsed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'doc-click', 
  'edit-doc', 
  'add-doc', 
  'add-child-doc', 
  'copy',
  'slider-drop',
  'slider-item-drop',
  'update:collapsed'
]);

const leftNavRef = ref(null);
const isCollapsed = ref(props.collapsed);

const toggleNav = () => {
  isCollapsed.value = !isCollapsed.value;
  emit('update:collapsed', isCollapsed.value);
};

const handleResize = () => {
  if (window.innerWidth < 900) {
    isCollapsed.value = true;
  }
};

const onSliderDrop = (dropResult) => {
  emit('slider-drop', dropResult);
};

const onSliderItemDrop = (dropResult, slider) => {
  emit('slider-item-drop', { dropResult, slider });
};

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

defineExpose({
  getElement: () => leftNavRef.value
});
</script>

<style scoped>
.left-nav {
  width: 260px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  flex-shrink: 0;
}

.left-nav.collapsed {
  width: 40px;
}

.left-nav-header {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.nav-toggle {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.nav-toggle:hover {
  background: #f3f4f6;
}

.nav-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.slider-content {
  min-height: 100%;
}

.slider-item {
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.slider-item:hover {
  background: #f3f4f6;
}

.slider-item.active {
  background: #d1fae5;
  color: #059669;
}

.slider-item.active span {
  color: #059669;
}

.slider-item.group {
  border-top: 1px solid rgba(60, 60, 67, 0.12);
  margin-top: 12px;
  padding-top: 10px;
}

.slider-item .label {
  font-weight: 700;
  color: rgba(60, 60, 67);
}

.slider-header {
  display: flex;
  align-items: center;
}

.slider-header .btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  margin-right: 5px;
  opacity: 0;
  transition: opacity 0.2s;
}

.slider-item:hover .btn {
  opacity: 1;
}

.column-drag-handle {
  margin-right: 5px;
  cursor: grab;
}

.group-children {
  padding-left: 20px;
  margin-top: 4px;
}

.child-item {
  font-size: 13px;
}

.left-nav-footer {
  padding: 6px 10px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.link-info {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
  height: 18px;
}

.link-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-info.empty {
  justify-content: center;
}

.placeholder {
  color: #9ca3af;
}
</style>
