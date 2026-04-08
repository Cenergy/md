<template>
  <div class="voice-input-page">
    <div class="voice-header">
      <h2>语音输入</h2>
    </div>

    <div class="voice-content">
      <!-- 录音状态指示 -->
      <div class="recording-indicator" :class="{ active: isRecording }">
        <div class="pulse-ring" v-if="isRecording"></div>
        <el-icon :size="48" :color="isRecording ? '#f56c6c' : '#909399'">
          <Microphone />
        </el-icon>
        <span class="recording-text">{{ recordingStatusText }}</span>
        <span class="recording-time" v-if="isRecording">{{ formattedTime }}</span>
      </div>

      <!-- 录音控制按钮 -->
      <div class="control-buttons">
        <el-button
          type="success"
          size="large"
          :icon="VideoPlay"
          :disabled="isRecording"
          @click="startRecording"
        >
          开始录音
        </el-button>
        <el-button
          type="danger"
          size="large"
          :icon="VideoPause"
          :disabled="!isRecording"
          @click="stopRecording"
        >
          结束录音
        </el-button>
      </div>

      <!-- 文本输入区域 -->
      <div class="text-area-wrapper">
        <el-input
          v-model="transcriptText"
          type="textarea"
          :rows="5"
          placeholder="语音转文字结果将显示在这里，也可以手动输入..."
          resize="none"
        />
      </div>

      <!-- 发送按钮 -->
      <div class="send-area">
        <el-button
          type="primary"
          size="large"
          :icon="Promotion"
          :disabled="!transcriptText.trim()"
          @click="sendText"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { Microphone, VideoPlay, VideoPause, Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// ==================== 状态 ====================
const isRecording = ref(false)
const isRecognizing = ref(false)
const transcriptText = ref('')
const recordingTime = ref(0)
let timer = null
let mediaStream = null
let audioContext = null
let scriptProcessor = null
let ws = null

const recordingStatusText = computed(() => {
  if (isRecognizing.value) return '识别中...'
  if (isRecording.value) return '录音中...'
  return '未开始录音'
})

const formattedTime = computed(() => {
  const mins = Math.floor(recordingTime.value / 60).toString().padStart(2, '0')
  const secs = (recordingTime.value % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
})

// ==================== 开始录音 ====================
async function startRecording() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      ElMessage.error('当前浏览器不支持录音，请使用 Chrome 并通过 HTTPS 或 localhost 访问')
      return
    }

    // 1. 获取麦克风
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // 2. 从后端获取签名 URL
    const voiceId = generateUUID()
    const { data } = await axios.get('/api/voice/asr/sign', {
      params: { voice_id: voiceId, engine_model_type: '16k_zh' }
    })

    if (!data.ok) {
      ElMessage.error('获取签名失败')
      releaseMic()
      return
    }

    // 3. 创建 AudioContext（使用浏览器原生采样率，后续重采样到 16kHz）
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const source = audioContext.createMediaStreamSource(mediaStream)

    scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)
    source.connect(scriptProcessor)
    scriptProcessor.connect(audioContext.destination)

    // 4. 连接腾讯云 ASR WebSocket
    connectASR(data.url)

    // 5. 音频处理回调 — 重采样后发送
    scriptProcessor.onaudioprocess = (e) => {
      if (!isRecording.value || !ws || ws.readyState !== WebSocket.OPEN) return
      const pcmData = e.inputBuffer.getChannelData(0)
      const resampled = resampleTo16k(pcmData, audioContext.sampleRate)
      const pcm16 = float32ToInt16(resampled)
      // 腾讯云要求发送二进制帧
      ws.send(pcm16.buffer)
    }

    isRecording.value = true
    recordingTime.value = 0
    timer = setInterval(() => { recordingTime.value++ }, 1000)
    ElMessage.success('开始录音')

  } catch (err) {
    console.error('录音启动失败:', err)
    if (err.name === 'NotAllowedError') {
      ElMessage.error('麦克风权限被拒绝，请在浏览器设置中允许访问')
    } else if (err.name === 'NotFoundError') {
      ElMessage.error('未找到麦克风设备')
    } else {
      ElMessage.error(`录音失败: ${err.message}`)
    }
  }
}

// ==================== 连接腾讯云 ASR ====================
function connectASR(signUrl) {
  ws = new WebSocket(signUrl)

  ws.onopen = () => {
    console.log('腾讯云 ASR WebSocket 已连接')
  }

  ws.onmessage = (event) => {
    try {
      // 腾讯云返回的可能是文本 JSON 或二进制
      let data = event.data
      if (typeof data !== 'string') {
        console.log('ASR 收到非文本消息:', data)
        return
      }

      const res = JSON.parse(data)
      console.log('ASR 返回:', JSON.stringify(res))

      if (res.code !== 0) {
        console.error('ASR 错误:', res.code, res.message)
        ElMessage.error(`识别错误: ${res.message}`)
        return
      }

      // 提取识别文字 — 兼容多种返回格式
      const result = res.result
      if (!result) return

      let text = ''
      // 格式1: result.text 直接有文字
      if (result.text) {
        text = result.text
      }
      // 格式2: result.voice_text_str
      if (!text && result.voice_text_str) {
        text = result.voice_text_str
      }
      // 格式3: result.slice_type
      const sliceType = result.slice_type

      if (sliceType === 0 || sliceType === 1) {
        // 中间结果 / 一句话结束 — 追加
        transcriptText.value += text
      } else if (sliceType === 2) {
        // 最终结果
        transcriptText.value += text
        isRecognizing.value = false
      } else if (text) {
        // 兜底：有文字就追加
        transcriptText.value += text
      }
    } catch (e) {
      console.error('解析 ASR 消息失败:', e, event.data)
    }
  }

  ws.onerror = (err) => {
    console.error('ASR WebSocket 错误:', err)
    ElMessage.error('语音识别连接失败')
  }

  ws.onclose = () => {
    console.log('ASR WebSocket 已关闭')
    ws = null
  }
}

// ==================== 结束录音 ====================
function stopRecording() {
  isRecording.value = false
  isRecognizing.value = true
  clearInterval(timer)
  timer = null

  // 关闭 WebSocket（腾讯云收到关闭帧后会返回最终结果）
  if (ws) {
    ws.close()
    ws = null
  }

  releaseMic()
  ElMessage.info('录音已结束，等待识别完成...')
}

// ==================== 发送 ====================
function sendText() {
  if (!transcriptText.value.trim()) return
  // TODO: 发送文本逻辑
  ElMessage.success('发送成功')
  transcriptText.value = ''
}

// ==================== 工具函数 ====================
function releaseMic() {
  if (scriptProcessor) { scriptProcessor.disconnect(); scriptProcessor = null }
  if (audioContext) { audioContext.close(); audioContext = null }
  if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null }
}

function resampleTo16k(float32Array, srcSampleRate) {
  if (srcSampleRate === 16000) return float32Array
  const ratio = srcSampleRate / 16000
  const newLength = Math.round(float32Array.length / ratio)
  const result = new Float32Array(newLength)
  for (let i = 0; i < newLength; i++) {
    const srcIdx = i * ratio
    const low = Math.floor(srcIdx)
    const high = Math.min(low + 1, float32Array.length - 1)
    const frac = srcIdx - low
    result[i] = float32Array[low] * (1 - frac) + float32Array[high] * frac
  }
  return result
}

function float32ToInt16(float32Array) {
  const int16 = new Int16Array(float32Array.length)
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
  }
  return int16
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

// ==================== 清理 ====================
onUnmounted(() => {
  if (isRecording.value) stopRecording()
  if (ws) { ws.close(); ws = null }
})
</script>

<style scoped>
.voice-input-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
  box-sizing: border-box;
}

.voice-header {
  text-align: center;
  margin-bottom: 30px;
}

.voice-header h2 {
  margin: 0;
  color: #303133;
  font-size: 22px;
}

.voice-content {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* 录音状态指示 */
.recording-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.3s;
}

.recording-indicator.active {
  box-shadow: 0 2px 20px rgba(245, 108, 108, 0.3);
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid #f56c6c;
  animation: pulse 1.5s ease-out infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.4); opacity: 0; }
}

.recording-text {
  margin-top: 10px;
  font-size: 14px;
  color: #909399;
}

.recording-indicator.active .recording-text {
  color: #f56c6c;
}

.recording-time {
  margin-top: 4px;
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
  font-variant-numeric: tabular-nums;
}

/* 控制按钮 */
.control-buttons {
  display: flex;
  gap: 16px;
}

.control-buttons .el-button {
  min-width: 120px;
}

/* 文本区域 */
.text-area-wrapper {
  width: 100%;
}

.text-area-wrapper :deep(.el-textarea__inner) {
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.6;
}

/* 发送区域 */
.send-area {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.send-area .el-button {
  min-width: 120px;
}
</style>
