<template>
  <div class="login-page">
    <div class="main">
      <Header />
      <div class="login">
        <div class="login-container flex">
          <div class="item emial">
            <div class="login-header center">{{ headerTitle }}</div>
            <div class="login-form">
              <div class="login-content login-panel">
                <div class="item">
                  <div class="label">邮箱</div>
                  <input
                    type="text"
                    placeholder="hello@163.com"
                    inputmode="email"
                    class="input value"
                    v-model="email"
                  />
                </div>
                <transition name="slide-fade">
                <div class="item" v-if="register">
                   <div class="label">验证码</div>
                   <el-input
                     v-model="code"
                     placeholder="验证码"
                     class="input-with-select"
                     size="large"
                     @keyup.enter="submitInfo"
                   >
                     <template #append>
                       <el-button @click="getValidateCode" type="primary" style="width: 120px;">获取</el-button>
                     </template>
                   </el-input>
                </div>
                </transition>
                <div class="item">
                  <div class="label">密码</div>
                  <input
                    type="password"
                    placeholder="6-15位数"
                    class="input value"
                    v-model="password"
                    @keyup.enter="submitInfo"
                  />
                </div>
              </div>
              <div class="login-footer login-panel">
                <button class="login-btn" @click="submitInfo">{{ submitTitle }}</button>
                <div class="switch-mode">
                  <span>{{ register ? '已有账号？' : '还没有账号？' }}</span>
                  <span class="link" @click="register = !register">{{ register ? '去登录' : '去注册' }}</span>
                </div>
              </div>
              <div class="login-other login-panel flex"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Header from '@/components/Header.vue';
import { ElMessage } from 'element-plus';
import { isEmail, setToken } from '../utils';
import { sendVerifyCode, registerUser, loginUser } from '../request/http';

const register = ref(false);
const email = ref("");
const password = ref("");
const code = ref("");

const headerTitle = computed(() => {
    return register.value ? "邮箱注册" : "邮箱登录";
});

const submitTitle = computed(() => {
    return register.value ? "注册" : "登录";
});

const checkEmailValid = (t) => {
    if (!t || !isEmail(t)) {
        ElMessage.warning("你填写的邮箱不合法");
        return false;
    }
    return true;
};

const getValidateCode = async () => {
    const t = email.value;
    if (!checkEmailValid(t)) return;
    try {
        const res = await sendVerifyCode({ email: t });
        if (res && res.ok) {
            ElMessage.success("验证码发送成功");
        } else {
            ElMessage.error(res.message || "发送失败");
        }
    } catch (e) {
        ElMessage.error(e.message || "发送失败");
    }
};

const submitInfo = async () => {
    const i = email.value;
    const s = password.value;
    const n = code.value;
    const r = register.value;

    if (i && s) {
        if (!checkEmailValid(i)) return;
        
        if (r) {
            // Register logic
            if (n && n.length >= 4) {
                if (s.length >= 6 && s.length <= 15) {
                    try {
                        const res = await registerUser({ email: i, password: s, code: n });
                        if (res && res.ok) {
                            ElMessage.success(res.message || "注册成功,系统正在帮你自动登录,稍等片刻");
                            register.value = false;
                            setTimeout(() => {
                                submitInfo();
                            }, 2000);
                        } else {
                            ElMessage.error(res.message || "注册失败");
                        }
                    } catch (e) {
                        ElMessage.error(e.message || "注册失败");
                    }
                } else {
                    ElMessage.warning("密码长度6-15位");
                }
            } else {
                ElMessage.warning("是否忘记填写了验证码?");
            }
        } else {
            // Login logic
            try {
                const res = await loginUser({ email: i, password: s });
                if (res && res.data) {
                    setToken(res.data);
                    window.location.href = "./";
                } else {
                    throw new Error("Login failed: No token received");
                }
            } catch (e) {
                ElMessage.error(e.message || "登录失败");
            }
        }
    } else {
        ElMessage.warning("检查你的邮箱或者密码是否忘记填写了");
    }
};
</script>

<style scoped>
/* Adapted from login-50f4d272c9.css */
.login-page {
    background-size: cover;
    width: 100%;
    min-height: 100vh; /* Ensure full height */
    --color: #E1E1E1;
    background-color: #f3f3f3;
    background-image: linear-gradient(0deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%, transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%, transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%, transparent);
    background-size: 55px 55px;
    /* Reset margin/padding for the page wrapper if needed, though scoped handles class */
}

/* Flex utilities (from index.html/css likely) */
.flex {
    display: flex;
}
.center {
    text-align: center;
}

/* Header styles (from index.html structure, assuming some base styles) */
/* .header {
    padding: 10px 0;
} */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    box-sizing: border-box;
}
.logo a {
    text-decoration: none;
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

.main {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

button {
    height: 36px;
}

.login {
    position: relative;
    margin: auto; /* Center vertically and horizontally in flex container */
    width: 100%;
    max-width: 400px;
    min-height: 420px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    background: #fff;
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

.login-container {
    flex: 1;
    padding: 10px;
}

.login-container .item {
    width: 100%;
}

.login-header {
    font-size: 24px;
    padding: 20px 0;
    font-weight: 700;
    color: #333;
}

.login-form {
    /* height: 280px; Remove fixed height */
}

.login-panel {
    width: 100%;
    margin: auto;
}

.login-content {
    padding: 10px 0;
}

.login-content .item {
    margin-top: 15px;
    width: 100%;
}

.label {
    margin-bottom: 6px;
    font-weight: 500;
    color: #606266;
    font-size: 14px;
}

input.value {
    height: 40px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    width: 100%;
    padding: 0 12px;
    box-sizing: border-box;
    font-size: 14px;
    transition: all 0.2s;
    outline: none;
    box-shadow: none;
    color: #333;
}

input.value:focus {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.login-btn {
    padding: 0 20px;
    width: 100%;
    height: 40px;
    margin-top: 20px;
    font-size: 16px;
    letter-spacing: 1px;
}

/* Responsive adjustments */
@media (max-width: 480px) {
    .login {
        max-width: 90%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        min-height: auto;
    }
    
    .login-header {
        font-size: 20px;
        padding: 15px 0;
    }
}


.login-other {
    padding: 10px;
}

.login-other a img {
    height: 30px;
}

.wechat-tooltip {
    width: 300px;
    position: relative;
    top: -100px;
}

.login-btn {
    align-items: center;
    background-color: #409eff;
    border: none;
    border-radius: .25rem;
    box-shadow: rgba(0, 0, 0, .02) 0 1px 3px 0;
    box-sizing: border-box;
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    font-family: system-ui, -apple-system, system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-weight: 600;
    justify-content: center;
    line-height: 1.25;
    text-decoration: none;
    transition: all 250ms;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    vertical-align: baseline;
    width: 100%;
}

.login-btn:focus,
.login-btn:hover {
    border-color: rgba(0, 0, 0, .15);
    box-shadow: rgba(0, 0, 0, .1) 0 4px 12px;
    background-color: #66b1ff;
    color: #fff;
}

.login-btn:hover {
    transform: translateY(-1px);
}

.login-btn:active {
    background-color: #3a8ee6;
    border-color: rgba(0, 0, 0, .15);
    box-shadow: rgba(0, 0, 0, .06) 0 2px 4px;
    color: #fff;
    transform: translateY(0);
}

.input {
    padding: 2px 5px;
    border: none;
    box-shadow: 1px 1px 2px 0 rgb(0, 0, 0, .2);
    outline: 0;
    color: #696969;
}

.input:invalid {
    animation: justshake .3s forwards;
    color: red;
}

@keyframes justshake {
    25% { transform: translateX(5px); }
    50% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
    100% { transform: translateX-(5px); }
}

.switch-mode {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    font-size: 14px;
    color: #606266;
}

.switch-mode .link {
    color: #409eff;
    cursor: pointer;
    margin-left: 8px;
    font-weight: 500;
}

.switch-mode .link:hover {
    text-decoration: underline;
}

/* Transition styles */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
  max-height: 100px;
  opacity: 1;
  overflow: hidden;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
</style>
