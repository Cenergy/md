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
        <ProjectCard
          v-for="(project, index) in projects"
          :key="project.id"
          :project="project"
          :index="index"
          mode="owner"
          @profile="handleProfile"
          @docs="handleDocs"
          @collaborate="handleCollaborate"
          @build="handleBuild"
        />
      </div>

      <el-divider
        content-position="center"
        v-if="collaborateProjects.length > 0"
        >参与协作的项目</el-divider
      >

      <div class="project-list" v-if="collaborateProjects.length > 0">
        <ProjectCard
          v-for="project in collaborateProjects"
          :key="project.id"
          :project="project"
          mode="collaborator"
          @docs="handleDocs"
          @build="handleBuild"
        />
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

    <ProjectSettingsModal
      v-model:visible="showSettingsModal"
      v-model:modal-active-tab="modalActiveTab"
      v-model:search-keywords="searchKeywords"
      v-model:delete-confirm-input="deleteConfirmInput"
      :current-project="currentProject"
      :themes="themes"
      :search-loading="searchLoading"
      :search-data="searchData"
      :link-users="linkUsers"
      :show-delete-confirm-input="showDeleteConfirmInput"
      :delete-loading="deleteLoading"
      @closed="handleSettingsModalClosed"
      @settings-tab-click="handleSettingsTabClick"
      @save-profile="saveProfile"
      @add-feature="addFeature"
      @delete-feature="deleteFeature"
      @delete-project="handleDeleteProject"
      @cancel-delete-confirm="cancelDeleteConfirm"
      @search-user="handleSearchUser"
      @add-link-user="addLinkUser"
      @delete-link-user="handleDeleteLinkUser"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import Header from "@/components/Header.vue";
import ProjectCard from "@/components/ProjectCard.vue";
import ProjectSettingsModal from "@/components/ProjectSettingsModal.vue";
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

}
</style>
