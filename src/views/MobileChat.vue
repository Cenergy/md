<template>
  <div class="mobile-chat">
    <div v-if="error" class="error-container">
      <el-icon :size="60" color="var(--danger-color)"><CircleClose /></el-icon>
      <p class="error-message">{{ error }}</p>
      <el-button type="primary" @click="connect">重新连接</el-button>
    </div>

    <div v-else-if="!connected" class="connecting">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>正在连接...</p>
    </div>

    <div v-else class="chat-interface">
      <div class="chat-header">
        <span>防汛助手 - 移动端</span>
      </div>

      <div class="message-list" ref="messageListRef">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message-item', msg.role === 'user' ? 'user-message' : 'ai-message']"
        >
          <div class="message-content">{{ msg.content }}</div>
        </div>
        <div v-if="loading" class="message-item ai-message">
          <div class="message-content">
            <el-icon class="is-loading"><Loading /></el-icon> 思考中...
          </div>
        </div>
      </div>

      <div class="input-area">
        <el-input
          v-model="inputMessage"
          placeholder="输入消息..."
          @keydown.enter="sendMessage"
          class="chat-input"
        >
          <template #append>
            <el-button type="primary" :icon="Promotion" @click="sendMessage" :disabled="!inputMessage.trim() || loading" />
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, Promotion, CircleClose } from '@element-plus/icons-vue'
import axios from 'axios'

interface Message {
  role: 'user' | 'ai'
  content: string
}

const route = useRoute()
const sessionId = route.params.sessionId as string

const connected = ref(false)
const error = ref('')
const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const messageListRef = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

const connect = async () => {
  error.value = ''
  try {
    const response = await axios.post(`/api/mobile/connect/${sessionId}`)
    if (response.data.ok) {
      connected.value = true
      ElMessage.success('连接成功')
    }
  } catch (err: any) {
    if (err.response?.status === 403) {
      error.value = err.response.data.message || '已有移动端连接，请稍后再试'
    } else {
      error.value = '连接失败，请重新扫描二维码'
    }
  }
}

const disconnect = async () => {
  if (!sessionId || !connected.value) return
  try {
    await axios.post(`/api/mobile/disconnect/${sessionId}`)
  } catch (err) {
    // ignore
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return

  const message = inputMessage.value.trim()
  messages.value.push({ role: 'user', content: message })
  inputMessage.value = ''
  loading.value = true
  scrollToBottom()

  try {
    await axios.post(`/api/mobile/message/${sessionId}`, { message })
    messages.value.push({ role: 'ai', content: '消息已发送到电脑端' })
  } catch (err) {
    ElMessage.error('发送失败')
    messages.value.push({ role: 'ai', content: '发送失败，请重试' })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

onMounted(() => {
  if (sessionId) {
    connect()
  } else {
    error.value = '无效的会话ID'
  }
})

onUnmounted(() => {
  disconnect()
})

window.addEventListener('beforeunload', disconnect)
</script>

<style scoped>
.mobile-chat {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px;
}

.error-message {
  font-size: 16px;
  color: var(--danger-color);
  text-align: center;
}

.connecting {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: var(--text-secondary);
}

.chat-interface {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  height: 50px;
  line-height: 50px;
  padding: 0 15px;
  background: var(--primary-color);
  color: var(--btn-primary-text);
  font-size: 16px;
  font-weight: bold;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.message-item {
  margin-bottom: 15px;
  display: flex;
}

.user-message {
  justify-content: flex-end;
}

.ai-message {
  justify-content: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.user-message .message-content {
  background: var(--primary-color);
  color: var(--btn-primary-text);
  border-bottom-right-radius: 2px;
}

.ai-message .message-content {
  background: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 2px;
}

.input-area {
  padding: 10px;
  background: var(--card-bg);
  border-top: 1px solid var(--border-color);
}

.chat-input {
  width: 100%;
}
</style>
