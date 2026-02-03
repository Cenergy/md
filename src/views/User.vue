<template>
  <div class="user-page">
    <div class="header">
      <div class="container flex">
        <div class="logo item">
          <a href="https://mdpress.glicon.design/">mdpress</a>
        </div>
        <div class="menu flex">
          <div class="item"><a href="https://mdpress.glicon.design/start.html">教程</a></div>
          <div class="item">
            <router-link to="/projects">项目</router-link>
          </div>
          <div class="item"><a href="https://mdpress.glicon.design/problem.html">常见问题</a></div>
          <div class="item"><a href="https://mdpress.glicon.design/about.html">关于</a></div>
        </div>
        <div class="users flex">
          <div class="item green">
             <router-link to="/user"><i class="iconfont icon-ziyuanxhdpi"></i></router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="userinfo-panel container content-container">
      <div class="el-card userinfo-card is-always-shadow">
        <div class="el-card__header">
          <div class="clearfix">
            <span>
              <i class="iconfont icon-ziyuanxhdpi green main-icon"></i>&nbsp;基本信息
              <el-button type="danger" size="small" style="float: right" @click="handleLogout">
                退出登录
              </el-button>
            </span>
          </div>
        </div>
        <div class="el-card__body">
          <div class="userinfo">
            <div class="item flex">
              <div class="label">昵称</div>
              <div class="value flex">
                <div class="value-input">
                  <el-input v-model="userInfo.name" size="small" placeholder="请输入昵称"></el-input>
                </div>
                &nbsp;
                <el-button size="small" @click="updateUserName" :loading="updateLoading">更新</el-button>
              </div>
            </div>
            <div class="item flex">
              <div class="label">邮箱</div>
              <div class="value">
                <div class="value-input">
                  <el-input v-model="userInfo.email" size="small" disabled></el-input>
                </div>
              </div>
            </div>
            <div class="item flex">
              <div class="label">登记方式</div>
              <div class="value">
                <i :class="['iconfont', loginIcon]"></i>&nbsp;{{ loginTypeLabel }}
              </div>
            </div>
            <div class="item flex">
              <div class="label">用户编号</div>
              <div class="value flex">
                <div class="value-input">
                  <el-input v-model="userInfo.id" size="small" disabled></el-input>
                </div>
                &nbsp;
                <el-button size="small" @click="copyValue(userInfo.id)">复制</el-button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import useClipboard from 'vue-clipboard3';
import { queryUserInfo, updateUserInfoName, refreshUserToken,validateToken } from '../request/http';
import { removeToken } from '../utils';
import router from '../router';

const { toClipboard } = useClipboard();

const userInfo = ref({});
const updateLoading = ref(false);

const loginIcon = computed(() => {
    return userInfo.value.email ? "icon-youxiang1" : "icon-weixin";
});

const loginTypeLabel = computed(() => {
    return userInfo.value.email ? "邮箱" : "微信扫码";
});

const getUserInfo = async () => {
    try {
        const data = await queryUserInfo({});
        if (data) {
            userInfo.value = data.userInfo || {};
        }
    } catch (e) {
        ElMessage.error(e.message || '获取用户信息失败');
    }
};

const updateUserName = async () => {
    const name = userInfo.value.name;
    if (name && name.length > 20) {
        ElMessage.warning('昵称长度不能超过20');
        return;
    }
    updateLoading.value = true;
    try {
        await updateUserInfoName({ name });
        ElMessage.success('更新成功');
    } catch (e) {
        ElMessage.error(e.message || '更新失败');
    } finally {
        updateLoading.value = false;
    }
};

const copyValue = async (text) => {
    if (!text) return;
    try {
        await toClipboard(text);
        ElMessage.success(`复制 ${text} 成功`);
    } catch (e) {
        ElMessage.error('复制失败');
    }
};

const handleLogout = () => {
    ElMessageBox.confirm('你确定要退出登录状态?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        removeToken();
        router.push('/login');
    }).catch(() => {});
};

onMounted(async () => {
    const token = getToken();
    if (!token) {
        router.push('/login');
        return;
    }
    try {
        const isValid = await validateToken(token);
        if (isValid) {
            getUserInfo();
        } else {
            removeToken();
            router.push('/login');
        }
    } catch (e) {
        removeToken();
        router.push('/login');
    }
});
</script>

<style scoped>
.user-page {
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

/* User Info Styles */
.main-icon {
    font-size: 20px;
}

.userinfo-panel {
    padding-top: 40px;
}

.userinfo-card {
    width: 800px;
    margin: auto;
    margin-bottom: 20px;
}

.userinfo .item {
    margin-top: 14px;
    align-items: center;
}

.userinfo .item .label {
    width: 100px;
}

.userinfo .item .value {
    width: 600px;
    display: flex;
    align-items: center;
}

.value-input {
    width: 400px;
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
