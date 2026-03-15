<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(value) => emit('update:visible', value)"
    class="project-settings-modal"
    width="60%"
    top="0"
    transition="fade-dialog"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    @closed="emit('closed')"
  >
    <template #header>
      <div class="custom-modal-header">
        <span class="modal-title">{{ currentProject ? currentProject.name : "" }}</span>
        <span class="modal-subtitle">项目配置</span>
      </div>
    </template>
    <div class="modal-content-wrapper" v-if="currentProject">
      <el-tabs
        :model-value="modalActiveTab"
        @update:model-value="(value) => emit('update:modalActiveTab', value)"
        class="settings-tabs"
        @tab-click="(tab) => emit('settings-tab-click', tab)"
      >
        <el-tab-pane label="项目配置" name="settings">
          <div class="tab-panel">
            <el-form :model="currentProject" label-width="120px" size="mini">
              <el-form-item label="项目名称">
                <el-input v-model="currentProject.name" :readonly="!canEdit" placeholder="VitePress"></el-input>
              </el-form-item>
              <el-form-item label="markdown主题">
                <el-select v-model="currentProject.theme" :disabled="!canEdit" placeholder="请选择" style="width: 100%">
                  <el-option
                    v-for="item in themes"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
                <a href="./theme.html" target="_blank" class="el-link el-link--default is-underline"
                  ><span class="el-link--inner">不知道怎么选?点我</span></a
                >
              </el-form-item>
              <el-form-item label="菜单主题颜色">
                <el-color-picker v-model="currentProject.themeColor" :disabled="!canEdit" size="mini"></el-color-picker>
              </el-form-item>

              <el-form-item label="简易描述">
                <el-input
                  v-model="currentProject.text"
                  :readonly="!canEdit"
                  placeholder="Vite & Vue Powered Static Site Generator"
                ></el-input>
              </el-form-item>
              <el-form-item label="宣传语">
                <el-input
                  type="textarea"
                  v-model="currentProject.tagline"
                  :readonly="!canEdit"
                  placeholder="Simple, powerful, and fast. Meet the modern SSG framework you've always wanted."
                  :rows="2"
                ></el-input>
              </el-form-item>
              <el-form-item label="特点">
                <el-button v-if="canEdit" type="text" @click="emit('add-feature')">+添加</el-button>
                <div class="feature-row">
                  <div
                    v-for="(feature, index) in currentProject.features"
                    :key="index"
                    class="item"
                    style="margin-bottom: 10px; border: 1px solid #eee; padding: 10px"
                  >
                    <el-row :gutter="10" style="margin-bottom: 5px">
                      <el-col :span="3" :xs="24" class="mobile-label">标题</el-col>
                      <el-col :span="15" :xs="18">
                        <el-input
                          v-model="feature.title"
                          :readonly="!canEdit"
                          placeholder="Focus on Your Content"
                          size="mini"
                        ></el-input>
                      </el-col>
                      <el-col :span="6" :xs="6">
                        <el-button v-if="canEdit" type="danger" size="mini" @click="emit('delete-feature', index)"
                          >删除</el-button
                        >
                      </el-col>
                    </el-row>
                    <el-row :gutter="10">
                      <el-col :span="3" :xs="24" class="mobile-label">描述</el-col>
                      <el-col :span="18" :xs="24">
                        <el-input
                          type="textarea"
                          v-model="feature.details"
                          :readonly="!canEdit"
                          placeholder="Effortlessly create beautiful documentation sites with just markdown."
                          :rows="2"
                          size="mini"
                        ></el-input>
                      </el-col>
                    </el-row>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="github地址">
                <el-input
                  v-model="currentProject.github"
                  :readonly="!canEdit"
                  placeholder="https://github.com/deyihu/maptalks-study"
                ></el-input>
              </el-form-item>
              <el-form-item label="知乎地址">
                <el-input
                  v-model="currentProject.zhihu"
                  :readonly="!canEdit"
                  placeholder="https://www.zhihu.com/people/de-yi-3-36"
                ></el-input>
              </el-form-item>
              <el-form-item label="稀土掘金地址">
                <el-input
                  v-model="currentProject.juejin"
                  :readonly="!canEdit"
                  placeholder="https://juejin.cn/user/1714850585917101"
                ></el-input>
              </el-form-item>
              <el-form-item label="iconfont地址">
                <el-input
                  v-model="currentProject.iconfontUrl"
                  :readonly="!canEdit"
                  placeholder="//at.alicdn.com/t/c/font_3975977_4a47fo4twin.css"
                ></el-input>
              </el-form-item>

              <div v-if="canEdit" class="danger-zone">
                <div class="danger-title">⚠️危险操作</div>
                <div class="danger-content">
                  <div class="danger-item">
                    <div class="danger-info">
                      <h4>删除项目</h4>
                      <p>一旦你删除项目，所有数据都会被永久删除，无法找回。请谨慎操作。</p>
                      <el-input
                        v-if="showDeleteConfirmInput"
                        :model-value="deleteConfirmInput"
                        @update:model-value="(value) => emit('update:deleteConfirmInput', value)"
                        class="delete-confirm-input"
                        :placeholder="`请输入项目ID ${currentProject.id} 确认删除`"
                      ></el-input>
                    </div>
                    <div class="danger-actions">
                      <el-button v-if="showDeleteConfirmInput" @click="emit('cancel-delete-confirm')"
                        >取消</el-button
                      >
                      <el-button
                        type="danger"
                        :plain="!showDeleteConfirmInput"
                        :loading="deleteLoading"
                        @click="emit('delete-project')"
                        >{{ showDeleteConfirmInput ? "确认删除" : "删除项目" }}</el-button
                      >
                    </div>
                  </div>
                </div>
              </div>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="协作管理" name="collaborate">
          <div class="tab-panel">
            <div v-if="canEdit" class="search-box">
              <el-input
                :model-value="searchKeywords"
                @update:model-value="(value) => emit('update:searchKeywords', value)"
                placeholder="输入邮箱搜索用户"
                class="search-input"
              ></el-input>
              <el-button type="primary" @click="emit('search-user')" :loading="searchLoading"
                >搜索</el-button
              >
            </div>
            <div v-if="canEdit && searchData.length > 0" class="search-results">
              <h4>搜索结果</h4>
              <div v-for="(user, idx) in searchData" :key="user.id" class="user-item">
                <span class="user-email" :title="user.email">{{ user.email }}</span>
                <el-button type="success" size="small" @click="emit('add-link-user', idx, user)"
                  >添加</el-button
                >
              </div>
            </div>

            <h4>当前协作者</h4>
            <div v-for="user in linkUsers" :key="user.id" class="user-item">
              <span class="user-email" :title="user.email">{{ user.email }}</span>
              <el-button type="danger" size="small" @click="emit('delete-link-user', user)"
                >{{ canEdit ? "删除" : "退出" }}</el-button
              >
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="emit('update:visible', false)">{{
          modalActiveTab === "settings" ? "取消" : "关闭"
        }}</el-button>
        <el-button v-if="modalActiveTab === 'settings' && canEdit" type="primary" @click="emit('save-profile')"
          >保存</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  currentProject: {
    type: Object,
    default: null,
  },
  modalActiveTab: {
    type: String,
    default: "settings",
  },
  themes: {
    type: Array,
    default: () => [],
  },
  searchKeywords: {
    type: String,
    default: "",
  },
  searchLoading: {
    type: Boolean,
    default: false,
  },
  searchData: {
    type: Array,
    default: () => [],
  },
  linkUsers: {
    type: Array,
    default: () => [],
  },
  showDeleteConfirmInput: {
    type: Boolean,
    default: false,
  },
  deleteConfirmInput: {
    type: String,
    default: "",
  },
  deleteLoading: {
    type: Boolean,
    default: false,
  },
  canEdit: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "update:visible",
  "update:modalActiveTab",
  "update:searchKeywords",
  "update:deleteConfirmInput",
  "closed",
  "settings-tab-click",
  "save-profile",
  "add-feature",
  "delete-feature",
  "delete-project",
  "cancel-delete-confirm",
  "search-user",
  "add-link-user",
  "delete-link-user",
]);
</script>

<style>
.custom-modal-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.modal-subtitle {
  font-size: 14px;
  color: #999;
  font-weight: normal;
}

.modal-content-wrapper {
  height: 100%;
  overflow: hidden;
  padding: 12px 0 0;
}

.settings-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.settings-tabs .el-tabs__content {
  flex: 1;
  min-height: 0;
}

.settings-tabs .el-tab-pane {
  height: 100%;
}

.tab-panel {
  height: 100%;
  overflow-y: auto;
  padding: 8px 14px 16px 0;
  box-sizing: border-box;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: #c8c9cc transparent;
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
}

.search-results {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-item:hover {
  background-color: #f0f2f5;
}

.user-email {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 10px;
  font-size: 14px;
  color: #606266;
}

.danger-zone {
  margin-top: 40px;
  margin-bottom: 40px;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  overflow: hidden;
}

.danger-title {
  padding: 12px 24px;
  background-color: #fff1f0;
  border-bottom: 1px solid #ffccc7;
  font-size: 14px;
  font-weight: 600;
  color: #cf1322;
}

.danger-content {
  padding: 0 24px 16px;
  background-color: #fff;
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  gap: 16px;
}

.danger-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.danger-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.danger-info p {
  margin: 0;
  font-size: 14px;
  color: #595959;
}

.delete-confirm-input {
  margin-top: 12px;
  max-width: 420px;
}

.project-settings-modal,
.project-settings-modal .el-dialog {
  width: 60% !important;
  max-width: 960px;
  height: 80vh;
  margin: 0 auto !important;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
}

.project-settings-modal .el-dialog__header,
.project-settings-modal .el-dialog__footer {
  flex-shrink: 0;
}

.project-settings-modal .el-dialog__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0 24px;
}

.tab-panel::-webkit-scrollbar {
  width: 8px;
}

.tab-panel::-webkit-scrollbar-track {
  background: transparent;
}

.tab-panel::-webkit-scrollbar-thumb {
  background: #c8c9cc;
  border-radius: 4px;
}

.tab-panel::-webkit-scrollbar-thumb:hover {
  background: #a8abb2;
}

@media (max-width: 768px) {
  .project-settings-modal,
  .project-settings-modal .el-dialog {
    width: 92% !important;
    height: 88vh;
    max-width: none;
  }

  .project-settings-modal .el-dialog__body {
    padding: 0 16px;
  }

  .mobile-label {
    margin-bottom: 5px;
    font-weight: bold;
    color: #606266;
    font-size: 14px;
    line-height: 20px;
  }

  .danger-title,
  .danger-content {
    padding-left: 16px;
    padding-right: 16px;
  }

  .danger-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .danger-actions {
    width: 100%;
  }

  .danger-actions .el-button {
    width: 100%;
  }
}

.fade-dialog-enter-active,
.fade-dialog-leave-active {
  transition: opacity 0.25s ease;
}

.fade-dialog-enter-from,
.fade-dialog-leave-to {
  opacity: 0;
}
</style>
