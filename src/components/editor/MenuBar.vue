<template>
  <div class="menu-container flex">
    <div class="project-text menu-panel">{{ projectName }}</div>
    <div class="menu-panel flex">
      <Container @drop="onMenuDrop" orientation="horizontal" class="flex">
        <Draggable v-for="(menu, index) in menus" :key="index">
          <el-tooltip content="可以拖拽来调节菜单顺序" placement="top">
            <div
              class="item draggable-item"
              :class="{ active: menu.isActive }"
              @click="$emit('menu-click', menu)"
            >
              {{ menu.name }}
            </div>
          </el-tooltip>
        </Draggable>
      </Container>
    </div>
    <div class="menu-panel flex" style="align-items: center; flex: 1; padding-right: 20px; justify-content: space-between">
      <div class="left-action">
        <el-button type="primary" size="mini" @click="$emit('add-menu')" plain>
          <i class="iconfont icon-tianjia"></i> +菜单
        </el-button>
      </div>
      <div class="right-action flex" style="align-items: center">
        <div style="width: 1px; height: 16px; background: #e5e7eb; margin: 0 10px"></div>
        <el-checkbox :model-value="hideHeader" @update:model-value="$emit('update:hideHeader', $event)" size="mini" border>隐藏头部</el-checkbox>
        <el-checkbox :model-value="hideLinksPanel" @update:model-value="$emit('update:hideLinksPanel', $event)" size="mini" border>隐藏侧边</el-checkbox>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Container, Draggable } from 'vue3-smooth-dnd';

const props = defineProps({
  projectName: {
    type: String,
    default: ''
  },
  menus: {
    type: Array,
    default: () => []
  },
  hideHeader: {
    type: Boolean,
    default: false
  },
  hideLinksPanel: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['menu-click', 'add-menu', 'update:hideHeader', 'update:hideLinksPanel', 'menu-drop']);

const onMenuDrop = (dropResult) => {
  emit('menu-drop', dropResult);
};
</script>

<style>
/* Styles are defined in global CSS: src/assets/css/edit.css */
</style>
