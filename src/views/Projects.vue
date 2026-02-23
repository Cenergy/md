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
          shadow="always"
        >
          <template #header>
            <div class="clearfix">
              <span
                ><i class="iconfont icon-xiangmu"></i>&nbsp;{{ index + 1 }}.{{
                  project.name
                }}</span
              >
            </div>
          </template>
          <div>
            <div style="padding: 4px">
              <el-button type="primary" link @click="handleProfile(project)"
                >基本信息</el-button
              >
              <el-button type="primary" link @click="handleEdit(project)"
                >编辑</el-button
              >
              <el-button type="primary" link @click="handleDocs(project)"
                >文档</el-button
              >
              <el-button type="primary" link @click="handleCollaborate(project)"
                >协作</el-button
              >
            </div>
            <br />
            <el-button :loading="project.loading" @click="handleBuild(project)"
              >编译项目</el-button
            >
            &nbsp;
            <a
              :href="project.url"
              target="_blank"
              class="el-link el-link--default is-underline"
            >
              <span class="el-link--inner">浏览地址</span>
            </a>
            <br /><br />项目编号:{{ project.id }}<br />
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
          v-for="(project, index) in collaborateProjects"
          :key="project.id"
          class="project-card"
          shadow="always"
        >
          <template #header>
            <div class="clearfix">
              <span
                ><i class="iconfont icon-xiangmu"></i>&nbsp;协作:{{
                  index + 1
                }}.{{ project.name }}</span
              >
            </div>
          </template>
          <div>
            <div style="padding: 4px">
              <el-button type="primary" link @click="handleDocs(project)"
                >文档</el-button
              >
            </div>
            <br />
            <el-button :loading="project.loading" @click="handleBuild(project)"
              >编译项目</el-button
            >
            &nbsp;
            <a
              :href="project.url"
              target="_blank"
              class="el-link el-link--default is-underline"
            >
              <span class="el-link--inner">浏览地址</span>
            </a>
            <br /><br />项目编号:{{ project.id }}<br />
          </div>
        </el-card>
      </div>
    </div>

    <!-- Add/Edit Project Dialog -->
    <el-dialog
      :title="isEdit ? '编辑项目' : '添加项目'"
      v-model="dialogVisible"
      width="30%"
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

    <!-- Profile Drawer -->
    <el-drawer
      v-model="profileDrawerVisible"
      :title="currentProject ? currentProject.name : ''"
      size="30%"
    >
      <div
        aria-modal="true"
        aria-labelledby="el-drawer__title"
        aria-label="gishai"
        role="dialog"
        tabindex="-1"
        class="el-drawer rtl"
        style="width: 100%"
        v-if="currentProject"
      >
        <header id="el-drawer__title" class="el-drawer__header">
          <span role="heading" title="gishai">gishai</span
          ><button
            aria-label="close gishai"
            type="button"
            class="el-drawer__close-btn"
          >
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </header>
        <section class="el-drawer__body">
          <el-form :model="currentProject" label-width="120px" size="mini">
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
            <el-form-item label="产品名字">
              <el-input
                v-model="currentProject.name"
                placeholder="VitePress"
              ></el-input>
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
                    <el-col :span="3">标题</el-col>
                    <el-col :span="18">
                      <el-input
                        v-model="feature.title"
                        placeholder="Focus on Your Content"
                        size="mini"
                      ></el-input>
                    </el-col>
                    <el-col :span="3">
                      <el-button
                        type="danger"
                        size="mini"
                        @click="deleteFeature(index)"
                        >删除</el-button
                      >
                    </el-col>
                  </el-row>
                  <el-row :gutter="10">
                    <el-col :span="3">描述</el-col>
                    <el-col :span="18">
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
            <el-form-item>
              <el-button type="primary" @click="saveProfile">保存</el-button>
            </el-form-item>
          </el-form>
        </section>
      </div>
    </el-drawer>

    <!-- Collaborate Drawer -->
    <el-drawer
      v-model="collaborateDrawerVisible"
      :title="linkUserTitle"
      size="30%"
    >
      <div style="padding: 20px">
        <div style="margin-bottom: 20px">
          <el-input
            v-model="searchKeywords"
            placeholder="输入邮箱搜索用户"
            style="width: 200px; margin-right: 10px"
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
          style="
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          "
        >
          <h4>搜索结果</h4>
          <div
            v-for="(user, idx) in searchData"
            :key="user.id"
            class="flex"
            style="justify-content: space-between; margin-bottom: 5px"
          >
            <span>{{ user.email }}</span>
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
          class="flex"
          style="justify-content: space-between; margin-bottom: 5px"
        >
          <span>{{ user.email }}</span>
          <el-button
            type="danger"
            size="small"
            @click="handleDeleteLinkUser(user)"
            >删除</el-button
          >
        </div>
      </div>
    </el-drawer>
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

// Profile Drawer State
const profileDrawerVisible = ref(false);
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

// Collaborate Drawer State
const collaborateDrawerVisible = ref(false);
const linkUserTitle = ref("");
const searchKeywords = ref("");
const searchLoading = ref(false);
const searchData = ref([]);
const linkUsers = ref([]);
const currentLinkProject = ref(null);

// Methods
const getHost = () => {
  return import.meta.env.VITE_BASE_URL || window.location.origin;
};

const formatProjectURL = (project) => {
  if (import.meta.env.DEV) {
    return `http://localhost:3000/p/${project.id}/`;
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

const handleEdit = (project) => {
  isEdit.value = true;
  form.name = project.name;
  form.id = project.id;
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

// Profile Methods
const handleProfile = async (project) => {
  try {
    const data = await queryProjectProfile({ projectId: project.id });
    console.log("🚀 ~ handleProfile ~ data:", data)
    currentProject.value = {
      features: [],
      themeColor: "#10b981",
      theme: "vitepress",
      ...data.data.hero || {},
      id: project.id,
      name: project.name, // Ensure name is present
    };
    console.log("🚀 ~ handleProfile ~ currentProject:", currentProject)
    profileDrawerVisible.value = true;
  } catch (e) {
    ElMessage.error("获取项目配置失败");
  }
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
    await saveProjectProfile({
      projectId: currentProject.value.id,
      profileData: currentProject.value,
    });
    ElMessage.success(`保存 ${currentProject.value.name} 首页文案信息成功`);
    profileDrawerVisible.value = false;
  } catch (e) {
    ElMessage.error("保存失败");
  }
};

// Collaborate Methods
const handleCollaborate = async (project) => {
  currentLinkProject.value = project;
  linkUserTitle.value = `${project.name} 协作管理页面`;
  searchKeywords.value = "";
  searchData.value = [];
  collaborateDrawerVisible.value = true;
  loadLinkUsers(project.id);
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
  min-height: 100vh;
  padding-top: 20px; /* Add some spacing from header */
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
    grid-template-columns: 1fr;
  }
  
  .container {
    padding: 0 15px;
  }
}

.project-card {
  border-radius: 8px; /* More modern radius */
  transition: all 0.3s;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}
</style>