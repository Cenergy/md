<template>
  <div class="projects-page">
    <Header />

    <div class="project-panel container content-container">
      <el-alert
        title="如果编译失败请检查你的文件里是否有图片等一些链接是不可用的,如果是的请使用绝对地址或者上传文件用站内的地址"
        type="warning"
        show-icon
        :closable="true"
        style="margin-bottom: 20px"
      >
      </el-alert>

      <div class="project-tool">
        <el-button type="primary" @click="handleAddProject">+项目</el-button>
      </div>

      <div class="project-list">
        <el-card
          v-for="(project, index) in projects"
          :key="project.id"
          class="project-card"
          :body-style="{ padding: '0px', display: 'flex', flexDirection: 'column', height: '100%' }"
        >
          <div class="project-header">
            <div class="project-title">
              <i class="iconfont icon-xiangmu"></i>
              <span>{{ project.name }}</span>
            </div>
            <div class="project-index">#{{ index + 1 }}</div>
          </div>
          
          <div class="project-body">
            <div class="action-grid">
              <div class="action-item" @click="handleProfile(project)">
                <i class="iconfont icon-xiugai"></i>
                <span>设置</span>
              </div>
              <div class="action-item" @click="handleDocs(project)">
                <i class="iconfont icon-jiaocheng"></i>
                <span>创作</span>
              </div>
              <div class="action-item" @click="handleCollaborate(project)">
                <i class="iconfont icon-renren"></i>
                <span>协作</span>
              </div>
            </div>
            
            <div class="build-section">
              <el-button 
                type="primary" 
                class="build-btn" 
                :loading="project.loading" 
                @click="handleBuild(project)"
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
      </div>

      <el-divider
        content-position="center"
        v-if="collaborateProjects.length > 0"
        >参与协作的项目</el-divider
      >

      <div class="project-list" v-if="collaborateProjects.length > 0">
        <el-card
          v-for="project in collaborateProjects"
          :key="project.id"
          class="project-card collaborate-card"
          :body-style="{ padding: '0px', display: 'flex', flexDirection: 'column', height: '100%' }"
        >
          <div class="project-header">
            <div class="project-title">
              <i class="iconfont icon-xiangmu"></i>
              <span>{{ project.name }}</span>
            </div>
            <div class="project-tag">协作</div>
          </div>
          
          <div class="project-body">
            <div class="action-grid">
              <div class="action-item" @click="handleDocs(project)">
                <i class="iconfont icon-jiaocheng"></i>
                <span>文档</span>
              </div>
            </div>
            
            <div class="build-section">
              <el-button 
                type="primary" 
                class="build-btn" 
                :loading="project.loading" 
                @click="handleBuild(project)"
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
      </div>
    </div>

    <!-- Add/Edit Project Dialog -->
    <el-dialog
      :title="isEdit ? '编辑项目' : '添加项目'"
      v-model="dialogVisible"
      class="responsive-dialog"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="form.name" placeholder="请输入项目名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitProject"
            :loading="saveLoading"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- Project Settings Modal -->
    <el-dialog
      v-model="showSettingsModal"
      class="project-settings-modal"
      width="60%"
      top="0"
      transition="fade-dialog"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      @closed="handleSettingsModalClosed"
    >
      <template #header>
        <div class="custom-modal-header">
          <span class="modal-title">{{ currentProject ? currentProject.name : '' }}</span>
          <span class="modal-subtitle">项目配置</span>
        </div>
      </template>
      <div class="modal-content-wrapper" v-if="currentProject">
        <el-tabs v-model="modalActiveTab" class="settings-tabs" @tab-click="handleSettingsTabClick">
          <el-tab-pane label="项目配置" name="settings">
            <div class="tab-panel">
              <el-form :model="currentProject" label-width="120px" size="mini">
                <el-form-item label="项目名称">
                  <el-input
                    v-model="currentProject.name"
                    placeholder="VitePress"
                  ></el-input>
                </el-form-item>
                <el-form-item label="markdown主题">
                  <el-select
                    v-model="currentProject.theme"
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in themes"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                  <a
                    href="./theme.html"
                    target="_blank"
                    class="el-link el-link--default is-underline"
                    ><!----><span class="el-link--inner">不知道怎么选?点我</span
                    ><!----></a
                  ><!---->
                </el-form-item>
                <el-form-item label="菜单主题颜色">
                  <el-color-picker
                    v-model="currentProject.themeColor"
                    size="mini"
                  ></el-color-picker>
                </el-form-item>

                <el-form-item label="简易描述">
                  <el-input
                    v-model="currentProject.text"
                    placeholder="Vite & Vue Powered Static Site Generator"
                  ></el-input>
                </el-form-item>
                <el-form-item label="宣传语">
                  <el-input
                    type="textarea"
                    v-model="currentProject.tagline"
                    placeholder="Simple, powerful, and fast. Meet the modern SSG framework you've always wanted."
                    :rows="2"
                  ></el-input>
                </el-form-item>
                <el-form-item label="特点">
                  <el-button type="text" @click="addFeature">+添加</el-button>
                  <div class="feature-row">
                    <div
                      v-for="(feature, index) in currentProject.features"
                      :key="index"
                      class="item"
                      style="
                        margin-bottom: 10px;
                        border: 1px solid #eee;
                        padding: 10px;
                      "
                    >
                      <el-row :gutter="10" style="margin-bottom: 5px">
                        <el-col :span="3" :xs="24" class="mobile-label">标题</el-col>
                        <el-col :span="15" :xs="18">
                          <el-input
                            v-model="feature.title"
                            placeholder="Focus on Your Content"
                            size="mini"
                          ></el-input>
                        </el-col>
                        <el-col :span="6" :xs="6">
                          <el-button
                            type="danger"
                            size="mini"
                            @click="deleteFeature(index)"
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
                    placeholder="https://github.com/deyihu/maptalks-study"
                  ></el-input>
                </el-form-item>
                <el-form-item label="知乎地址">
                  <el-input
                    v-model="currentProject.zhihu"
                    placeholder="https://www.zhihu.com/people/de-yi-3-36"
                  ></el-input>
                </el-form-item>
                <el-form-item label="稀土掘金地址">
                  <el-input
                    v-model="currentProject.juejin"
                    placeholder="https://juejin.cn/user/1714850585917101"
                  ></el-input>
                </el-form-item>
                <el-form-item label="iconfont地址">
                  <el-input
                    v-model="currentProject.iconfontUrl"
                    placeholder="//at.alicdn.com/t/c/font_3975977_4a47fo4twin.css"
                  ></el-input>
                </el-form-item>

                <div class="danger-zone">
                  <div class="danger-title">⚠️危险操作</div>
                  <div class="danger-content">
                    <div class="danger-item">
                      <div class="danger-info">
                        <h4>删除项目</h4>
                        <p>一旦你删除项目，所有数据都会被永久删除，无法找回。请谨慎操作。</p>
                        <el-input
                          v-if="showDeleteConfirmInput"
                          v-model="deleteConfirmInput"
                          class="delete-confirm-input"
                          :placeholder="`请输入项目ID ${currentProject.id} 确认删除`"
                        ></el-input>
                      </div>
                      <div class="danger-actions">
                        <el-button
                          v-if="showDeleteConfirmInput"
                          @click="cancelDeleteConfirm"
                        >取消</el-button>
                        <el-button
                          type="danger"
                          :plain="!showDeleteConfirmInput"
                          :loading="deleteLoading"
                          @click="handleDeleteProject"
                        >{{ showDeleteConfirmInput ? "确认删除" : "删除项目" }}</el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </el-form>
            </div>
          </el-tab-pane>
          <el-tab-pane label="协作管理" name="collaborate">
            <div class="tab-panel">
              <div class="search-box">
                <el-input
                  v-model="searchKeywords"
                  placeholder="输入邮箱搜索用户"
                  class="search-input"
                ></el-input>
                <el-button
                  type="primary"
                  @click="handleSearchUser"
                  :loading="searchLoading"
                  >搜索</el-button
                >
              </div>
              <div
                v-if="searchData.length > 0"
                class="search-results"
              >
                <h4>搜索结果</h4>
                <div
                  v-for="(user, idx) in searchData"
                  :key="user.id"
                  class="user-item"
                >
                  <span class="user-email" :title="user.email">{{ user.email }}</span>
                  <el-button
                    type="success"
                    size="small"
                    @click="addLinkUser(idx, user)"
                    >添加</el-button
                  >
                </div>
              </div>

              <h4>当前协作者</h4>
              <div
                v-for="user in linkUsers"
                :key="user.id"
                class="user-item"
              >
                <span class="user-email" :title="user.email">{{ user.email }}</span>
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDeleteLinkUser(user)"
                  >删除</el-button
                >
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSettingsModal = false">{{ modalActiveTab === "settings" ? "取消" : "关闭" }}</el-button>
          <el-button v-if="modalActiveTab === 'settings'" type="primary" @click="saveProfile">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import Header from "@/components/Header.vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getToken } from "@/utils";

import {
  queryProjectList,
  queryCollaborateProjects,
  saveProject,
  updateProject,
  buildProject,
  queryProjectProfile,
  saveProjectProfile,
  searchUser,
  queryProjectLinkUsers,
  saveProjectLinkUser,
  deleteProjectLinkUser,
  deleteProject,
} from "../request/http";

const router = useRouter();

// State
const projects = ref([]);
const collaborateProjects = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const saveLoading = ref(false);
const form = reactive({
  name: "",
  id: "",
});

// Profile Modal State
const showSettingsModal = ref(false);
const modalActiveTab = ref("settings");
const currentProject = ref(null);
const themes = [
  "vitepress",
  "v-green",
  "simplicity-green",
  "vuepress",
  "github",
  "github-dark",
  "serene-rose",
  "awesome-green",
  "channing-cyan",
  "chocolate",
  "condensed-night-purple",
  "nico",
  "rude-crab",
  "fancy",
  "jzman",
  "cyanosis",
  "devui-blue",
  "geek-black",
  "mk-cute",
  "scrolls",
  "smart-blue",
  "z-blue",
  "arknights",
  "Chinese-red",
  "greenwillow",
].map((e) => ({ value: e, label: e }));

const searchKeywords = ref("");
const searchLoading = ref(false);
const searchData = ref([]);
const linkUsers = ref([]);
const currentLinkProject = ref(null);
const showDeleteConfirmInput = ref(false);
const deleteConfirmInput = ref("");
const deleteLoading = ref(false);

// Methods
const getHost = () => {
  return import.meta.env.VITE_BASE_URL || window.location.origin;
};

const formatProjectURL = (project) => {
  if (import.meta.env.DEV) {
    const host = getHost();
    return `${host}/p/${project.id}/`;
  }
  return `https://note.gishai.top/p/${project.id}/`;
};

const loadProjects = async () => {
  try {
    const data = await queryProjectList({});
    projects.value = (data || []).map((p) => ({
      ...p,
      url: formatProjectURL(p),
      loading: false,
    }));
  } catch (e) {
    ElMessage.error("加载项目失败");
  }
};

const loadCollaborateProjects = async () => {
  try {
    const data = await queryCollaborateProjects({});
    collaborateProjects.value = (data || []).map((p) => ({
      ...p,
      url: formatProjectURL(p),
      loading: false,
    }));
  } catch (e) {
    // Silent fail or log
    console.error(e);
  }
};

const handleAddProject = () => {
  isEdit.value = false;
  form.name = "";
  form.id = "";
  dialogVisible.value = true;
};

const submitProject = async () => {
  if (!form.name || form.name.length < 3) {
    ElMessage.warning("请填写你的项目名称（至少3个字符）");
    return;
  }
  saveLoading.value = true;
  try {
    if (isEdit.value) {
      await updateProject({ id: form.id, name: form.name });
      ElMessage.success(`编辑项目(${form.name})成功`);
    } else {
      await saveProject({ name: form.name });
      ElMessage.success(`添加项目(${form.name})成功`);
    }
    dialogVisible.value = false;
    loadProjects();
  } catch (e) {
    ElMessage.error(e.message || "操作失败");
  } finally {
    saveLoading.value = false;
  }
};

const handleDocs = (project) => {
  // Navigate to Editor with project ID
  // In legacy: window.open("./edit.html?p=".concat(e));
  // In Vue 3 app: push to router with query
  router.push({
    path: "/editor",
    query: { p: project.id, name: project.name },
  });
};

const handleBuild = async (project) => {
  if (project.loading) return;
  project.loading = true;
  const startTime = Date.now();
  try {
    await buildProject({ projectId: project.id });
    const duration = (Date.now() - startTime) / 1000;
    ElMessage.success(`${project.name} 编译成功, 耗时:${duration}s`);
  } catch (e) {
    ElMessage.error(e.message || "编译失败");
  } finally {
    project.loading = false;
  }
};

const openProjectModal = async (project, tab = "settings") => {
  try {
    const data = await queryProjectProfile({ projectId: project.id });
    currentProject.value = {
      features: [],
      themeColor: "#10b981",
      theme: "vitepress",
      ...data.data.hero || {},
      id: project.id,
      name: project.name,
    };
    currentLinkProject.value = project;
    modalActiveTab.value = tab;
    if (tab === "collaborate") {
      await loadLinkUsers(project.id);
    }
    showSettingsModal.value = true;
  } catch (e) {
    ElMessage.error("获取项目配置失败");
  }
};

const handleProfile = async (project) => {
  await openProjectModal(project, "settings");
};

const addFeature = () => {
  if (currentProject.value) {
    currentProject.value.features.push({
      theme: "vitepress",
      title: "",
      details: "",
    });
  }
};

const deleteFeature = (index) => {
  if (currentProject.value) {
    currentProject.value.features.splice(index, 1);
  }
};

const saveProfile = async () => {
  if (!currentProject.value) return;
  try {
    // Update project name first
    if (currentProject.value.name) {
      await updateProject({ 
        id: currentProject.value.id, 
        name: currentProject.value.name 
      });
    }

    await saveProjectProfile({
      projectId: currentProject.value.id,
      profileData: currentProject.value,
    });
    ElMessage.success(`保存 ${currentProject.value.name} 配置成功`);
    showSettingsModal.value = false;
    loadProjects();
  } catch (e) {
    console.error(e);
    ElMessage.error("保存失败");
  }
};

const resetDeleteConfirm = () => {
  showDeleteConfirmInput.value = false;
  deleteConfirmInput.value = "";
};

const cancelDeleteConfirm = () => {
  resetDeleteConfirm();
};

const handleDeleteProject = async () => {
  if (!currentProject.value) return;
  if (!showDeleteConfirmInput.value) {
    showDeleteConfirmInput.value = true;
    return;
  }
  if (deleteConfirmInput.value !== currentProject.value.id) {
    ElMessage.warning("项目ID不匹配");
    return;
  }
  if (deleteLoading.value) return;
  deleteLoading.value = true;
  try {
    await deleteProject({ projectId: currentProject.value.id });
    ElMessage.success("项目删除成功");
    resetDeleteConfirm();
    showSettingsModal.value = false;
    loadProjects();
  } catch (e) {
    ElMessage.error(e.message || "删除失败");
  } finally {
    deleteLoading.value = false;
  }
};

const handleCollaborate = async (project) => {
  searchKeywords.value = "";
  searchData.value = [];
  await openProjectModal(project, "collaborate");
};

const handleSettingsTabClick = async (tab) => {
  if (tab.props.name !== "collaborate" || !currentProject.value) return;
  currentLinkProject.value = {
    id: currentProject.value.id,
    name: currentProject.value.name,
  };
  await loadLinkUsers(currentProject.value.id);
};

const handleSettingsModalClosed = () => {
  modalActiveTab.value = "settings";
  searchKeywords.value = "";
  searchData.value = [];
  resetDeleteConfirm();
};

const loadLinkUsers = async (projectId) => {
  try {
    const data = await queryProjectLinkUsers({ projectId });
    linkUsers.value = data || [];
  } catch (e) {
    ElMessage.error("获取协作者失败");
  }
};

const handleSearchUser = async () => {
  if (!searchKeywords.value) return;
  searchLoading.value = true;
  try {
    const data = await searchUser({ keywords: searchKeywords.value });
    if (!data || data.length === 0) {
      ElMessage.warning(
        "没有查询到用户,切换输入条件或者提醒对用用户来注册账号"
      );
    }
    searchData.value = data || [];
  } catch (e) {
    ElMessage.error("搜索失败");
  } finally {
    searchLoading.value = false;
  }
};

const addLinkUser = async (index, user) => {
  if (!currentLinkProject.value) return;
  try {
    await saveProjectLinkUser({
      projectId: currentLinkProject.value.id,
      uid: user.id,
      email: user.email,
    });
    ElMessage.success(
      `已经成功的将 ${user.email} 加入 ${currentLinkProject.value.name} 的协作者`
    );
    searchData.value.splice(index, 1);
    loadLinkUsers(currentLinkProject.value.id);
  } catch (e) {
    ElMessage.error("添加协作者失败");
  }
};

const handleDeleteLinkUser = async (user) => {
  if (!currentLinkProject.value) return;
  try {
    await deleteProjectLinkUser({
      projectId: currentLinkProject.value.id,
      uid: user.id,
    });
    ElMessage.success(`删除协作者 ${user.email} 成功`);
    loadLinkUsers(currentLinkProject.value.id);
  } catch (e) {
    ElMessage.error("删除协作者失败");
  }
};

onMounted(() => {
  // 检查是否有有效 token
  const token = getToken();
  if (!token) {
    ElMessage.error("请先登录");
    router.push("/login");
    return;
  }
  loadProjects();
  loadCollaborateProjects();
});
</script>

<style scoped>
/* Reuse styles from index.css and project.css conceptually, or just basic Element Plus + Flex */
.projects-page {
  background-color: #f5f7f9;
  /* Ensure scrollability */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 100vh;
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
}

.project-panel {
  margin-top: 20px;
  padding-bottom: 50px;
}

.project-tool {
  margin-bottom: 20px;
  text-align: right;
}

.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .project-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .container {
    padding: 0 12px;
  }

  .action-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .project-body {
    padding: 16px;
  }

  .project-header {
    padding: 12px 16px;
  }
}

.project-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
  /* Ensure card doesn't overflow container width */
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
  /* Flexible width handling */
  flex: 1;
  min-width: 0;
  margin-right: 12px;
}

.project-title span {
  /* Proper text truncation */
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
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
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

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
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

@media (max-width: 768px) {
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
</style>

<style>
/* Global styles for responsive dialog - placed outside scoped block */
.responsive-dialog {
  width: 30% !important; /* Default desktop width */
}

@media (max-width: 768px) {
  .responsive-dialog {
    width: 90% !important;
    margin-top: 20vh !important;
  }
  
  /* Stack label and input on mobile */
  .responsive-dialog .el-form-item {
    display: block !important;
    margin-bottom: 20px;
  }
  
  .responsive-dialog .el-form-item__label {
    width: 100% !important;
    text-align: left !important;
    display: block !important;
    float: none !important;
    padding: 0 0 8px 0 !important;
    line-height: normal !important;
  }
  
  .responsive-dialog .el-form-item__content {
    margin-left: 0 !important;
    display: block !important;
  }
}

/* Responsive Drawer Styles */
.responsive-drawer {
  width: 30% !important;
}

@media (max-width: 768px) {
  .responsive-drawer {
    /* Set width to 85% instead of 100% to allow closing by clicking outside */
    width: 85% !important;
  }
  
  .responsive-drawer .el-form-item {
    display: block !important;
    margin-bottom: 20px;
  }
  
  .responsive-drawer .el-form-item__label {
    width: 100% !important;
    text-align: left !important;
    display: block !important;
    float: none !important;
    padding: 0 0 8px 0 !important;
    line-height: normal !important;
  }
  
  .responsive-drawer .el-form-item__content {
    margin-left: 0 !important;
    display: block !important;
  }

  .mobile-label {
    margin-bottom: 5px;
    font-weight: bold;
    color: #606266;
    font-size: 14px;
    line-height: 20px;
  }
}

/* Collaborate Drawer Styles */
.drawer-content {
  padding: 20px;
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

/* Project Settings Drawer Header Styles */
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
