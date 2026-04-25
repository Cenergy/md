<template>
  <div class="user-page">
    <Header />
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
import Header from '@/components/Header.vue';
import { getToken,removeToken} from '@/utils'
import { ElMessage, ElMessageBox } from 'element-plus';
import useClipboard from 'vue-clipboard3';
import { queryUserInfo, updateUserInfoName, refreshUserToken,validateToken } from '../request/http';
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
    background-color: var(--bg-color);
    min-height: 100vh;
}

.header {
    background: var(--card-bg);
    box-shadow: 0 1px 4px rgba(0,21,41,.08);
    height: 60px;
    line-height: 60px;
}

.container {
    width: 100%;
    max-width: 1200px;
    padding: 0 20px;
    box-sizing: border-box;
    margin: 0 auto;
}

.flex {
    display: flex;
}

.header .logo a {
    font-size: 24px;
    color: var(--text-color);
    text-decoration: none;
    font-weight: bold;
    margin-right: 40px;
}

.header .menu .item {
    margin: 0 20px;
}

.header .menu .item a {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 16px;
}

.header .menu .item a.active,
.header .menu .item a:hover {
    color: var(--primary-color);
}

/* User Info Styles */
.main-icon {
    font-size: 20px;
    vertical-align: middle;
    margin-right: 8px;
}

.userinfo-panel {
    padding-top: 40px;
    padding-bottom: 40px;
}

.userinfo-card {
    width: 100%;
    max-width: 800px;
    margin: 0 auto 20px;
    border-radius: 8px;
    overflow: hidden;
}

.el-card__header {
    padding: 18px 20px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--card-bg);
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color);
}

.userinfo .item {
    margin-top: 24px;
    align-items: center;
}

.userinfo .item:first-child {
    margin-top: 0;
}

.userinfo .item .label {
    width: 100px;
    font-weight: 500;
    color: var(--text-secondary);
    flex-shrink: 0;
}

.userinfo .item .value {
    flex: 1;
    display: flex;
    align-items: center;
    min-width: 0;
}

.value-input {
    flex: 1;
    max-width: 400px;
}

/* Responsive Styles */
@media (max-width: 768px) {
    .userinfo-panel {
        padding-top: 20px;
    }

    .userinfo .item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .userinfo .item .label {
        width: 100%;
        margin-bottom: 4px;
    }

    .userinfo .item .value {
        width: 100%;
        flex-wrap: wrap;
        gap: 10px;
    }

    .value-input {
        width: 100%;
        max-width: none;
    }
    
    .el-button {
        width: auto;
    }
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
