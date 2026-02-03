<template>
  <div class="projects-page">
    <div class="header">
      <div class="container flex">
        <div class="logo item">
            <router-link to="/">MDPRESS</router-link>
        </div>
        <div class="menu flex">
          <div class="item">
            <router-link to="/projects" class="active">项目</router-link>
          </div>
        </div>
        <div class="users flex">
          <div class="item green">
             <router-link to="/user"><i class="iconfont icon-ziyuanxhdpi"></i></router-link>
          </div>
        </div>
      </div>
    </div>

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
        <el-card v-for="(project, index) in projects" :key="project.id" class="project-card" shadow="always">
          <template #header>
            <div class="clearfix">
              <span><i class="iconfont icon-xiangmu"></i>&nbsp;{{ index + 1 }}.{{ project.name }}</span>
            </div>
          </template>
          <div>
            <div style="padding: 4px">
              <el-button type="primary" link @click="handleProfile(project)">基本信息</el-button>
              <el-button type="primary" link @click="handleEdit(project)">编辑</el-button>
              <el-button type="primary" link @click="handleDocs(project)">文档</el-button>
              <el-button type="primary" link @click="handleCollaborate(project)">协作</el-button>
            </div>
            <br />
            <el-button :loading="project.loading" @click="handleBuild(project)">编译项目</el-button>
            &nbsp;
            <a :href="project.url" target="_blank" class="el-link el-link--default is-underline">
              <span class="el-link--inner">浏览地址</span>
            </a>
            <br /><br />项目编号:{{ project.id }}<br />
          </div>
        </el-card>
      </div>

      <el-divider content-position="center" v-if="collaborateProjects.length > 0">参与协作的项目</el-divider>

      <div class="project-list" v-if="collaborateProjects.length > 0">
        <el-card v-for="(project, index) in collaborateProjects" :key="project.id" class="project-card" shadow="always">
          <template #header>
            <div class="clearfix">
              <span><i class="iconfont icon-xiangmu"></i>&nbsp;协作:{{ index + 1 }}.{{ project.name }}</span>
            </div>
          </template>
          <div>
            <div style="padding: 4px">
              <el-button type="primary" link @click="handleDocs(project)">文档</el-button>
            </div>
            <br />
            <el-button :loading="project.loading" @click="handleBuild(project)">编译项目</el-button>
            &nbsp;
             <a :href="project.url" target="_blank" class="el-link el-link--default is-underline">
              <span class="el-link--inner">浏览地址</span>
            </a>
            <br /><br />项目编号:{{ project.id }}<br />
          </div>
        </el-card>
      </div>
    </div>

    <!-- Add/Edit Project Dialog -->
    <el-dialog :title="isEdit ? '编辑项目' : '添加项目'" v-model="dialogVisible" width="30%">
      <el-form :model="form" label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="form.name" placeholder="请输入项目名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProject" :loading="saveLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Profile Drawer -->
    <el-drawer v-model="profileDrawerVisible" :title="currentProject ? currentProject.name : ''" size="30%">
      <div v-if="currentProject" style="padding: 20px;">
         <el-form :model="currentProject" label-width="80px">
            <el-form-item label="主题颜色">
                <el-color-picker v-model="currentProject.themeColor"></el-color-picker>
            </el-form-item>
            <el-form-item label="主题">
                <el-select v-model="currentProject.theme" placeholder="请选择主题">
                    <el-option
                        v-for="item in themes"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
             <el-form-item label="Features">
                 <div v-for="(feature, idx) in currentProject.features" :key="idx" style="margin-bottom: 10px; border: 1px solid #eee; padding: 10px;">
                     <el-input v-model="feature.title" placeholder="Title" style="margin-bottom: 5px;"></el-input>
                     <el-input v-model="feature.details" type="textarea" placeholder="Details"></el-input>
                     <el-button type="danger" link @click="deleteFeature(idx)">删除</el-button>
                 </div>
                 <el-button @click="addFeature">+ Feature</el-button>
             </el-form-item>
             <el-button type="primary" @click="saveProfile">保存配置</el-button>
         </el-form>
      </div>
    </el-drawer>

    <!-- Collaborate Drawer -->
    <el-drawer v-model="collaborateDrawerVisible" :title="linkUserTitle" size="30%">
      <div style="padding: 20px;">
        <div style="margin-bottom: 20px;">
            <el-input v-model="searchKeywords" placeholder="输入邮箱搜索用户" style="width: 200px; margin-right: 10px;"></el-input>
            <el-button type="primary" @click="handleSearchUser" :loading="searchLoading">搜索</el-button>
        </div>
        <div v-if="searchData.length > 0" style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <h4>搜索结果</h4>
            <div v-for="(user, idx) in searchData" :key="user.id" class="flex" style="justify-content: space-between; margin-bottom: 5px;">
                <span>{{ user.email }}</span>
                <el-button type="success" size="small" @click="addLinkUser(idx, user)">添加</el-button>
            </div>
        </div>
        
        <h4>当前协作者</h4>
        <div v-for="user in linkUsers" :key="user.id" class="flex" style="justify-content: space-between; margin-bottom: 5px;">
             <span>{{ user.email }}</span>
             <el-button type="danger" size="small" @click="handleDeleteLinkUser(user)">删除</el-button>
        </div>
      </div>
    </el-drawer>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
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
    deleteProjectLinkUser
} from '../request/http';

const router = useRouter();

// State
const projects = ref([]);
const collaborateProjects = ref([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const saveLoading = ref(false);
const form = reactive({
    name: '',
    id: ''
});

// Profile Drawer State
const profileDrawerVisible = ref(false);
const currentProject = ref(null);
const themes = [
    "vitepress", "v-green", "simplicity-green", "vuepress", "github", "github-dark",
    "serene-rose", "awesome-green", "channing-cyan", "chocolate", "condensed-night-purple",
    "nico", "rude-crab", "fancy", "jzman", "cyanosis", "devui-blue", "geek-black",
    "mk-cute", "scrolls", "smart-blue", "z-blue", "arknights", "Chinese-red", "greenwillow"
].map(e => ({ value: e, label: e }));

// Collaborate Drawer State
const collaborateDrawerVisible = ref(false);
const linkUserTitle = ref('');
const searchKeywords = ref('');
const searchLoading = ref(false);
const searchData = ref([]);
const linkUsers = ref([]);
const currentLinkProject = ref(null);


// Methods
const getHost = () => {
   return import.meta.env.VITE_BASE_URL || window.location.origin;
}

const formatProjectURL = (project) => {
    // Basic implementation, assumes VITE_BASE_URL is set or uses origin
    // Adapting from legacy code: host.substring(0, host.lastIndexOf("/")) + "/p/".concat(e.id, "/")
    // But since we are likely in dev or prod, let's just use a relative path or fixed path for now if not sure.
    // Legacy: https://mdpress.glicon.design/p/ID/
    // We should probably respect the legacy format if it points to a deployed site.
    // Or if local, maybe it's different. Let's assume the legacy URL structure is what's desired for "Browse Address".
    return `https://mdpress.glicon.design/p/${project.id}/`; 
}

const loadProjects = async () => {
    try {
        const data = await queryProjectList({});
        projects.value = (data || []).map(p => ({
            ...p,
            url: formatProjectURL(p),
            loading: false
        }));
    } catch (e) {
        ElMessage.error('加载项目失败');
    }
};

const loadCollaborateProjects = async () => {
    try {
        const data = await queryCollaborateProjects({});
        collaborateProjects.value = (data || []).map(p => ({
            ...p,
            url: formatProjectURL(p),
            loading: false
        }));
    } catch (e) {
        // Silent fail or log
        console.error(e);
    }
};

const handleAddProject = () => {
    isEdit.value = false;
    form.name = '';
    form.id = '';
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
        ElMessage.warning('请填写你的项目名称（至少3个字符）');
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
        ElMessage.error(e.message || '操作失败');
    } finally {
        saveLoading.value = false;
    }
};

const handleDocs = (project) => {
    // Navigate to Editor with project ID
    // In legacy: window.open("./edit.html?p=".concat(e));
    // In Vue 3 app: push to router with query
    router.push({ path: '/editor', query: { p: project.id,name:project.name } });
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
        ElMessage.error(e.message || '编译失败');
    } finally {
        project.loading = false;
    }
};

// Profile Methods
const handleProfile = async (project) => {
    try {
        const data = await queryProjectProfile({ projectId: project.id });
        currentProject.value = {
            features: [],
            themeColor: "#10b981",
            theme: "vitepress",
            ...data,
            id: project.id,
            name: project.name // Ensure name is present
        };
        profileDrawerVisible.value = true;
    } catch (e) {
        ElMessage.error('获取项目配置失败');
    }
};

const addFeature = () => {
    if (currentProject.value) {
        currentProject.value.features.push({
            theme: "vitepress",
            title: "",
            details: ""
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
            profileData: currentProject.value 
        });
        ElMessage.success(`保存 ${currentProject.value.name} 首页文案信息成功`);
        profileDrawerVisible.value = false;
    } catch (e) {
        ElMessage.error('保存失败');
    }
};

// Collaborate Methods
const handleCollaborate = async (project) => {
    currentLinkProject.value = project;
    linkUserTitle.value = `${project.name} 协作管理页面`;
    searchKeywords.value = '';
    searchData.value = [];
    collaborateDrawerVisible.value = true;
    loadLinkUsers(project.id);
};

const loadLinkUsers = async (projectId) => {
    try {
        const data = await queryProjectLinkUsers({ projectId });
        linkUsers.value = data || [];
    } catch (e) {
        ElMessage.error('获取协作者失败');
    }
};

const handleSearchUser = async () => {
    if (!searchKeywords.value) return;
    searchLoading.value = true;
    try {
        const data = await searchUser({ keywords: searchKeywords.value });
        if (!data || data.length === 0) {
            ElMessage.warning('没有查询到用户,切换输入条件或者提醒对用用户来注册账号');
        }
        searchData.value = data || [];
    } catch (e) {
        ElMessage.error('搜索失败');
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
            email: user.email 
        });
        ElMessage.success(`已经成功的将 ${user.email} 加入 ${currentLinkProject.value.name} 的协作者`);
        searchData.value.splice(index, 1);
        loadLinkUsers(currentLinkProject.value.id);
    } catch (e) {
        ElMessage.error('添加协作者失败');
    }
};

const handleDeleteLinkUser = async (user) => {
    if (!currentLinkProject.value) return;
    try {
        await deleteProjectLinkUser({ 
            projectId: currentLinkProject.value.id, 
            uid: user.id 
        });
        ElMessage.success(`删除协作者 ${user.email} 成功`);
        loadLinkUsers(currentLinkProject.value.id);
    } catch (e) {
        ElMessage.error('删除协作者失败');
    }
};


onMounted(() => {
    loadProjects();
    loadCollaborateProjects();
});

</script>

<style scoped>
/* Reuse styles from index.css and project.css conceptually, or just basic Element Plus + Flex */
.projects-page {
    background-color: #f5f7f9;
    min-height: 100vh;
}

.header {
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);
    height: 60px;
    line-height: 60px;
}

.container {
    width: 1200px;
    margin: 0 auto;
}

.flex {
    display: flex;
}

.header .logo a {
    font-size: 24px;
    color: #333;
    text-decoration: none;
    font-weight: bold;
    margin-right: 40px;
}

.header .menu .item {
    margin: 0 20px;
}

.header .menu .item a {
    color: #666;
    text-decoration: none;
    font-size: 16px;
}

.header .menu .item a.active,
.header .menu .item a:hover {
    color: #10b981;
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

.project-card {
    border-radius: 4px;
    transition: all .3s;
}

.project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}
</style>