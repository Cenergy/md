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
                <div class="item flex">
                  <input
                    type="checkbox"
                    class="ui-checkbox register-box"
                    v-model="register"
                  /><label>注册模式</label>
                </div>
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
                <div class="item" v-if="register">
                   <div class="label">验证码</div>
                   <div class="flex">
                     <input type="text" v-model="code" class="input value" style="width: 60%" placeholder="验证码" />
                     <button @click="getValidateCode" style="width: 35%; margin-left: 5%">获取</button>
                   </div>
                </div>
                <div class="item">
                  <div class="label">密码</div>
                  <input
                    type="password"
                    placeholder="6-15位数"
                    class="input value"
                    v-model="password"
                  />
                </div>
              </div>
              <div class="login-footer login-panel">
                <button class="login-btn" @click="submitInfo">{{ submitTitle }}</button>
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
                if (res && res.token) {
                    setToken(res.token);
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
.header {
    /* Add some basic header styling if missing from scoped css */
    padding: 10px 0;
}
.container {
    width: 1200px;
    margin: 0 auto;
}
.logo a {
    text-decoration: none;
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

button {
    height: 28px;
}

.login {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -170px;
    margin-top: -250px;
    width: 340px;
    height: 420px;
    box-shadow: -2px 2px 30px #bebebe, -15px -15px 30px #fff;
    border-radius: 10px;
    background: #fff;
}

.login-container {
    height: calc(100% - 40px);
    padding: 4px;
}

.login-container .item {
    width: 100%;
    /* height: 100%; Removed because it breaks flex flow for inputs */
}

.login-header {
    font-size: 20px;
    padding: 15px 0;
    font-weight: 700;
}

.login-form {
    height: 280px;
}

.login-panel {
    width: 90%;
    margin: auto;
}

.login-content {
    padding: 10px;
}

.login-content .item {
    margin-top: 5px;
    width: 100%;
}

input.value {
    height: 24px;
    border: 1px solid #b3b3b3;
    width: 96%;
}

.login-btn {
    padding: 4px 10px;
    width: 100%;
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

button {
    align-items: center;
    background-image: linear-gradient(to right, #10b981 0, #141414 100%);
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
    width: auto;
}

button:focus,
button:hover {
    border-color: rgba(0, 0, 0, .15);
    box-shadow: rgba(0, 0, 0, .1) 0 4px 12px;
    color: rgba(0, 0, 0, .65);
}

button:hover {
    transform: translateY(-1px);
}

button:active {
    background-color: #f0f0f1;
    border-color: rgba(0, 0, 0, .15);
    box-shadow: rgba(0, 0, 0, .06) 0 2px 4px;
    color: rgba(0, 0, 0, .65);
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

.ui-checkbox {
    --primary-color: #141414;
    --secondary-color: #fff;
    --primary-hover-color: #4096ff;
    --checkbox-diameter: 20px;
    --checkbox-border-radius: 5px;
    --checkbox-border-color: #d9d9d9;
    --checkbox-border-width: 1px;
    --checkbox-border-style: solid;
    --checkmark-size: 1.2;
}

.ui-checkbox,
.ui-checkbox *,
.ui-checkbox ::after,
.ui-checkbox ::before {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}

.ui-checkbox {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: var(--checkbox-diameter);
    height: var(--checkbox-diameter);
    border-radius: var(--checkbox-border-radius);
    background: var(--secondary-color);
    border: var(--checkbox-border-width) var(--checkbox-border-style) var(--checkbox-border-color);
    -webkit-transition: all .3s;
    -o-transition: all .3s;
    transition: all .3s;
    cursor: pointer;
    position: relative;
    vertical-align: middle; /* Added for alignment with label */
    margin-right: 5px;
}

.ui-checkbox::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    -webkit-box-shadow: 0 0 0 calc(var(--checkbox-diameter)/ 2.5) var(--primary-color);
    box-shadow: 0 0 0 calc(var(--checkbox-diameter)/ 2.5) var(--primary-color);
    border-radius: inherit;
    opacity: 0;
    -webkit-transition: all .5s cubic-bezier(.12, .4, .29, 1.46);
    -o-transition: all .5s cubic-bezier(.12, .4, .29, 1.46);
    transition: all .5s cubic-bezier(.12, .4, .29, 1.46);
}

.ui-checkbox::before {
    top: 40%;
    left: 50%;
    content: "";
    position: absolute;
    width: 4px;
    height: 7px;
    border-right: 2px solid var(--secondary-color);
    border-bottom: 2px solid var(--secondary-color);
    -webkit-transform: translate(-50%, -50%) rotate(45deg) scale(0);
    -ms-transform: translate(-50%, -50%) rotate(45deg) scale(0);
    transform: translate(-50%, -50%) rotate(45deg) scale(0);
    opacity: 0;
    -webkit-transition: all .1s cubic-bezier(.71, -.46, .88, .6), opacity .1s;
    -o-transition: all .1s cubic-bezier(.71, -.46, .88, .6), opacity .1s;
    transition: all .1s cubic-bezier(.71, -.46, .88, .6), opacity .1s;
}

.ui-checkbox:hover {
    border-color: var(--primary-color);
}

.ui-checkbox:checked {
    background: var(--primary-color);
    border-color: transparent;
}

.ui-checkbox:checked::before {
    opacity: 1;
    -webkit-transform: translate(-50%, -50%) rotate(45deg) scale(var(--checkmark-size));
    -ms-transform: translate(-50%, -50%) rotate(45deg) scale(var(--checkmark-size));
    transform: translate(-50%, -50%) rotate(45deg) scale(var(--checkmark-size));
    -webkit-transition: all .2s cubic-bezier(.12, .4, .29, 1.46) .1s;
    -o-transition: all .2s cubic-bezier(.12, .4, .29, 1.46) .1s;
    transition: all .2s cubic-bezier(.12, .4, .29, 1.46) .1s;
}

.ui-checkbox:active:not(:checked)::after {
    -webkit-transition: none;
    -o-transition: none;
    -webkit-box-shadow: none;
    box-shadow: none;
    transition: none;
    opacity: 1;
}
</style>
