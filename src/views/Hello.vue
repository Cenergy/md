<template>
  <div class="chat-container">
    <div class="chat-header">
      <span>AI 防汛助手</span>
      <el-button type="primary" link :icon="Refresh" @click="clearHistory">清空对话</el-button>
    </div>

    <div class="message-list" ref="messageListRef">
      <div v-if="messages.length === 0" class="welcome-container">
        <div class="welcome-icon">
          <el-icon :size="40"><Cpu /></el-icon>
        </div>
        <h2 class="welcome-title">你好，我是防汛 AI 助手</h2>
        <p class="welcome-subtitle">我可以帮你查询水情、雨情，提供防汛决策支持</p>

        <div v-if="!mobileConnected" class="qrcode-section">
          <div class="qrcode-container">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code" class="qrcode-image" />
            <div v-else class="qrcode-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>生成二维码中...</span>
            </div>
          </div>
          <p class="qrcode-tip">扫描二维码，使用手机发送消息</p>
          <el-button type="primary" size="small" @click="openMobilePage" class="test-btn">
            打开移动端测试
          </el-button>
        </div>

        <div v-if="mobileConnected" class="mobile-connected-tip">
          <el-icon :size="24" color="#67c23a"><CircleCheck /></el-icon>
          <span>手机已连接，可以开始对话</span>
        </div>

        <div class="suggestion-grid">
          <div
            v-for="(item, index) in suggestedQuestions"
            :key="index"
            class="suggestion-card"
            :style="{
              opacity: isForbiddenUseAI ? 0.5 : 1,
              cursor: isForbiddenUseAI ? 'not-allowed' : 'pointer',
              backgroundColor: isForbiddenUseAI ? '#f5f7fa' : '',
            }"
            @click="!isForbiddenUseAI && askQuestion(item)"
          >
            <div class="suggestion-icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="suggestion-text">{{ item.text }}</div>
          </div>
        </div>
      </div>

      <div v-else>
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message-item', msg.role === 'user' ? 'user-message' : 'ai-message']"
        >
          <div class="message-avatar">
            <el-icon v-if="msg.role === 'user'" :size="20"><User /></el-icon>
            <el-icon v-else :size="20"><Cpu /></el-icon>
          </div>
          <div class="message-content">
            <div v-if="msg.content">{{ msg.content }}</div>

            <div v-if="msg.type === 'table' && msg.data" class="table-container">
              <el-table :data="msg.data" size="small" border style="width: 100%">
                <el-table-column
                  v-for="(col, colIndex) in msg.columns"
                  :key="colIndex"
                  :prop="col.prop"
                  :label="col.label"
                  :width="col.width"
                />
              </el-table>
            </div>

            <div
              v-if="msg.type === 'chart' && msg.chartOption"
              class="chart-container"
              :id="'chart-' + index"
            ></div>

            <div v-if="msg.actions" class="message-actions">
              <el-button
                v-for="(action, actIndex) in msg.actions"
                :key="actIndex"
                size="small"
                :type="action.type"
                :icon="action.icon"
                round
                :disabled="action.disabled"
                @click="handleAction(action.handler, action, index)"
              >
                {{ action.label }}
              </el-button>
            </div>
          </div>
        </div>
        <div v-if="loading" class="message-item ai-message">
          <div class="message-avatar">
            <el-icon :size="20"><Cpu /></el-icon>
          </div>
          <div class="message-content">
            <el-icon class="is-loading"><Loading /></el-icon> 思考中...
          </div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <div class="input-wrapper">
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6 }"
          placeholder="输入您的问题..."
          v-model="inputMessage"
          class="chat-textarea"
          @keydown.enter.prevent="handleEnter"
        />
        <div class="send-btn-wrapper">
          <el-button
            type="primary"
            size="small"
            :icon="Promotion"
            :disabled="!inputMessage.trim() || loading"
            @click="sendMessage"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="batchSmsDialogVisible"
      title="短信发送"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form label-position="top">
        <el-form-item label="预警对象">
          <el-tabs v-model="selectedSingleReservoir" type="card" closable @tab-remove="removeTab">
            <el-tab-pane
              v-for="reservoir in filteredReservoirs"
              :key="reservoir._uid"
              :label="reservoir.NAME"
              :name="reservoir._uid"
            />
          </el-tabs>
          <div v-if="checkedReservoirCodes.length < selectedReservoirs.length" style="margin-top: 5px">
            <el-button type="primary" link size="small" @click="restoreAllReservoirs">
              <el-icon><RefreshLeft /></el-icon>
              恢复全部预警对象 ({{ selectedReservoirs.length - checkedReservoirCodes.length }}个已移除)
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="发送对象">
          <el-select
            v-model="batchSmsTargets"
            multiple
            filterable
            allow-create
            placeholder="请选择发送对象"
            style="width: 100%"
          >
            <el-option
              v-for="(item, idx) of batchSendMsgLxrList"
              :key="idx"
              :value="item.FZRDH"
              :label="item.FZRJB + item.FZRXM + item.FZRDH"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="可用字段">
          <div style="display: flex; flex-wrap: wrap; gap: 5px">
            <el-tag
              v-for="field in availableFields"
              :key="field.key"
              @click="insertBatchField(field)"
              style="cursor: pointer"
              type="info"
              size="small"
            >
              {{ field.label }}
            </el-tag>
          </div>
          <div style="margin-top: 5px; color: var(--text-secondary); font-size: 12px">
            点击字段标签可插入到短信内容中，字段变量将根据每个重点防护对象的实际数据进行替换
          </div>
        </el-form-item>

        <el-form-item label="短信内容">
          <div style="margin-bottom: 10px">
            <el-button
              v-for="template in smsTemplates"
              :key="template.name"
              size="small"
              type="primary"
              plain
              @click="applySmsTemplate(template.content)"
              style="margin-right: 8px; margin-bottom: 5px"
            >
              {{ template.name }}
            </el-button>
          </div>
          <el-input
            v-model="batchSmsContent"
            type="textarea"
            :rows="5"
            placeholder="请输入短信内容，可点击上方字段标签插入变量"
          />
        </el-form-item>

        <el-form-item label="内容预览" v-if="batchSmsContent && checkedReservoirCodes.length > 0">
          <div class="preview-container">
            <div v-if="getSelectedSingleReservoirData()" class="preview-item">
              <div style="color: var(--text-secondary); line-height: 1.5">
                【深圳市光明区水务局】水务防汛{{ getPreviewContent(getSelectedSingleReservoirData()!) }}
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchSmsDialogVisible = false">保存</el-button>
        <el-button
          type="primary"
          @click="sendBatchSMS"
          :disabled="
            !checkedReservoirCodes.length ||
            !batchSmsContent.trim() ||
            isSending ||
            hasSent ||
            (checkedReservoirCodes.length === 1 && !batchSmsTargets.length)
          "
        >
          <span v-if="isSending">发送中...</span>
          <span v-else-if="hasSent">已发送</span>
          <span v-else>发送</span>
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, markRaw } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  User,
  Cpu,
  Loading,
  Promotion,
  RefreshLeft,
  DataLine,
  Document,
  VideoCamera,
  CircleCheck,
} from '@element-plus/icons-vue'
import { callCozeApi } from '@/request/coze'
import axios from 'axios'

interface MessageAction {
  label: string
  type: 'primary' | 'info' | 'success' | 'warning' | 'danger'
  handler: string
  icon: unknown
  disabled: boolean
}

interface Message {
  role: 'user' | 'ai'
  content: string
  type?: 'table' | 'chart'
  columns?: { prop: string; label: string; width?: number }[]
  data?: StationData[]
  chartOption?: Record<string, unknown>
  actions?: MessageAction[]
}

interface SuggestedQuestion {
  text: string
  icon: unknown
}

const isForbiddenUseAI = ref(false)
const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const messageListRef = ref<HTMLElement | null>(null)

const qrDataUrl = ref('')
const sessionId = ref('')
const mobileConnected = ref(false)
let eventSource: EventSource | null = null

const suggestedQuestions: SuggestedQuestion[] = [
  { text: '当前全区所有水库水位情况如何？', icon: markRaw(DataLine) },
  { text: '未来 24 小时降雨量预测', icon: markRaw(DataLine) },
  { text: '查询最近的防汛应急预案', icon: markRaw(Document) },
  { text: '显示重点水库实时监控画面', icon: markRaw(VideoCamera) },
]

const batchSmsDialogVisible = ref(false)
const selectedSingleReservoir = ref<string | null>(null)
const checkedReservoirCodes = ref<string[]>([])
const selectedReservoirs = ref<StationData[]>([])
const batchSmsTargets = ref<string[]>([])
const batchSendMsgLxrList = ref<ContactInfo[]>([])
const batchSmsContent = ref('')
const isSending = ref(false)
const hasSent = ref(false)
const currentSmsMessageIndex = ref<number | null>(null)

const tableData = ref<StationData[]>([])

const availableFields = [
  { key: 'NAME', label: '名称' },
  { key: 'LXR', label: '联系人' },
  { key: 'LXDH', label: '联系电话' },
  { key: 'SSJD', label: '所属街道' },
  { key: 'SSSQ', label: '所属社区' },
]

const smsTemplates = [
  {
    name: '防汛预警提示',
    content:
      '预警：受超强台风"桦加沙"影响，23日-24日我区将有强降雨与强风，您区域处于低洼易涝积水区域，致灾风险较高，请注意做好挡水板、防汛沙袋等防汛设施的准备工作，若有紧急情况，请联系：${QHSDJR}',
  },
  {
    name: '防汛超警',
    content:
      '预警：${NAME}水位已超过警戒线，请责任人${LXR}立即到岗到位，加强巡查监测，做好应急准备。',
  },
  {
    name: '暴雨预警',
    content:
      '预警：根据气象预报，未来24小时将有强降雨，请${NAME}责任人${LXR}做好防汛准备工作，加强值守。',
  },
  {
    name: '汛期巡查',
    content:
      '提示：请${NAME}责任人${LXR}按照巡查制度要求，定期开展安全巡查，发现问题及时处理并上报。',
  },
  {
    name: '应急响应',
    content:
      '响应：根据防汛指挥部要求，启动防汛应急响应，请${NAME}相关人员${LXR}立即到岗，执行应急预案。',
  },
  {
    name: '安全提醒',
    content:
      '提示：汛期期间，请${NAME}责任人${LXR}严格落实安全责任，确保人员安全，加强设施维护。',
  },
]

const filteredReservoirs = computed(() => {
  return selectedReservoirs.value.filter((r: StationData) => checkedReservoirCodes.value.includes(r._uid!))
})

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

const askQuestion = (item: SuggestedQuestion) => {
  inputMessage.value = item.text
  sendMessage()
}

const handleAction = (handlerName: string, actionItem: MessageAction, messageIndex: number) => {
  if (actionItem.disabled) return
  const handlers: Record<string, (index: number) => void> = {
    confirmSendSms,
    cancelSendSms,
    viewSmsContent,
  }
  if (handlers[handlerName]) {
    handlers[handlerName](messageIndex)
  }
}

const confirmSendSms = (messageIndex: number) => {
  if (typeof messageIndex === 'number' && messages.value[messageIndex]) {
    messages.value[messageIndex].actions?.forEach((a: MessageAction) => (a.disabled = true))
  }
  currentSmsMessageIndex.value = null

  messages.value.push({ role: 'user', content: '确定发送' })
  scrollToBottom()

  if (tableData.value && tableData.value.length > 0) {
    selectedReservoirs.value = tableData.value
    initBatchSmsData(false)
    sendBatchSMS()
  } else {
    ElMessage.warning('没有可发送的对象')
  }
}

const cancelSendSms = (messageIndex: number) => {
  if (typeof messageIndex === 'number' && messages.value[messageIndex]) {
    messages.value[messageIndex].actions?.forEach((a: MessageAction) => (a.disabled = true))
  }

  messages.value.push({ role: 'user', content: '取消发送' })
  scrollToBottom()
  loading.value = true
  setTimeout(() => {
    messages.value.push({
      role: 'ai',
      content: '已取消发送短信。',
    })
    loading.value = false
    scrollToBottom()
  }, 500)
}

const initBatchSmsData = (forceReset = true) => {
  batchSmsTargets.value = []

  if (forceReset || !batchSmsContent.value) {
    const defaultTemplate = smsTemplates.find((t) => t.name === '防汛超警')
    batchSmsContent.value = defaultTemplate ? defaultTemplate.content : ''
  }

  isSending.value = false
  hasSent.value = false

  selectedSingleReservoir.value =
    selectedReservoirs.value.length > 0 ? selectedReservoirs.value[0]._uid! : null

  const currentUids = selectedReservoirs.value.map((r: StationData) => r._uid)
  const hasValidSelection =
    checkedReservoirCodes.value &&
    checkedReservoirCodes.value.length > 0 &&
    checkedReservoirCodes.value.every((uid: string) => currentUids.includes(uid))

  if (forceReset || !hasValidSelection) {
    checkedReservoirCodes.value = currentUids as string[]
  }

  selectedReservoirs.value.forEach((r: StationData) => {
    const contacts = getReservoirContactList(r)
    if (forceReset) {
      r.selectedContacts = undefined
    }
    if (r.selectedContacts === undefined) {
      r.selectedContacts = contacts.map((c: ContactInfo) => c.FZRDH)
    }
  })

  buildBatchContactList()

  if (selectedReservoirs.value.length === 1) {
    const r = selectedReservoirs.value[0]
    batchSmsTargets.value = r.selectedContacts || []
  }
}

const viewSmsContent = (messageIndex: number) => {
  const isSameSession = currentSmsMessageIndex.value === messageIndex
  currentSmsMessageIndex.value = messageIndex

  if (tableData.value && tableData.value.length > 0) {
    selectedReservoirs.value = tableData.value
    if (!isSameSession) {
      initBatchSmsData()
    }
    batchSmsDialogVisible.value = true
  } else {
    ElMessage.warning('没有可发送的对象')
  }
}

const getReservoirContactList = (reservoir: StationData): ContactInfo[] => {
  const allContacts: ContactInfo[] = []

  if (reservoir) {
    if (reservoir.contactList && reservoir.contactList.length > 0) {
      reservoir.contactList.forEach((c: ContactInfo) => {
        if (c.FZRDH) {
          allContacts.push({
            FZRJB: c.FZRJB || (c._type === 'reservoir' ? '水库责任人' : '责任人'),
            FZRXM: c.FZRXM || '',
            FZRDH: c.FZRDH,
          })
        }
      })
    } else {
      if (reservoir.LXR && reservoir.LXDH)
        allContacts.push({ FZRJB: '(联系人)', FZRXM: reservoir.LXR, FZRDH: reservoir.LXDH })
      if (reservoir.QHSDJR && reservoir.QHSDJRDH)
        allContacts.push({ FZRJB: '(光环人员)', FZRXM: reservoir.QHSDJR, FZRDH: reservoir.QHSDJRDH })
      if (reservoir.XZRFZR && reservoir.XZRFZRDH)
        allContacts.push({
          FZRJB: '(行政责任人)',
          FZRXM: reservoir.XZRFZR,
          FZRDH: reservoir.XZRFZRDH,
        })
      if (reservoir.JSFZR && reservoir.JSFZRDH)
        allContacts.push({
          FZRJB: '(技术负责人)',
          FZRXM: reservoir.JSFZR,
          FZRDH: reservoir.JSFZRDH,
        })
    }
  }

  const unique = allContacts.filter(
    (c: ContactInfo, index: number, self: ContactInfo[]) =>
      index === self.findIndex((t: ContactInfo) => t.FZRDH === c.FZRDH)
  )

  return unique
}

const buildBatchContactList = () => {
  const r = selectedReservoirs.value.find((item: StationData) => item._uid === selectedSingleReservoir.value)

  if (r) {
    batchSendMsgLxrList.value = getReservoirContactList(r)

    if (r.selectedContacts) {
      batchSmsTargets.value = r.selectedContacts
    } else {
      batchSmsTargets.value = batchSendMsgLxrList.value.map((i: ContactInfo) => i.FZRDH)
      r.selectedContacts = batchSmsTargets.value
    }
  } else {
    batchSendMsgLxrList.value = []
    batchSmsTargets.value = []
  }
}

const removeTab = (targetName: string) => {
  const tabs = selectedReservoirs.value.filter((r: StationData) => checkedReservoirCodes.value.includes(r._uid!))
  let activeName = selectedSingleReservoir.value

  if (activeName === targetName) {
    tabs.forEach((tab: StationData, index: number) => {
      if (tab._uid === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab._uid!
        } else {
          activeName = null
        }
      }
    })
  }

  selectedSingleReservoir.value = activeName
  checkedReservoirCodes.value = checkedReservoirCodes.value.filter((code: string) => code !== targetName)

  if (activeName) {
    buildBatchContactList()
  } else {
    batchSendMsgLxrList.value = []
    batchSmsTargets.value = []
  }
}

const restoreAllReservoirs = () => {
  checkedReservoirCodes.value = selectedReservoirs.value.map((r: StationData) => r._uid!)
  if (!selectedSingleReservoir.value && checkedReservoirCodes.value.length > 0) {
    selectedSingleReservoir.value = checkedReservoirCodes.value[0]
  }
  buildBatchContactList()
}

const getSelectedSingleReservoirData = (): StationData | null => {
  if (!selectedSingleReservoir.value) return null
  return selectedReservoirs.value.find((r: StationData) => r._uid === selectedSingleReservoir.value) || null
}

const getPreviewContent = (reservoir: StationData): string => {
  let content = batchSmsContent.value || ''
  const fieldMap: Record<string, string> = {
    NAME: reservoir.NAME || '',
    LXR: reservoir.LXR || '',
    LXDH: reservoir.LXDH || '',
    SSJD: reservoir.SSJD || '',
    SSSQ: reservoir.SSSQ || '',
    QHSDJR: reservoir.QHSDJR || '',
    QHSDJRDH: reservoir.QHSDJRDH || '',
    XZRFZR: reservoir.XZRFZR || '',
    XZRFZRDH: reservoir.XZRFZRDH || '',
    JSFZR: reservoir.JSFZR || '',
    JSFZRDH: reservoir.JSFZRDH || '',
  }

  Object.keys(fieldMap).forEach((key: string) => {
    const regex = new RegExp(`\\$\\{${key}\\}`, 'g')
    content = content.replace(regex, fieldMap[key])
  })
  return content
}

const insertBatchField = (field: { key: string }) => {
  const placeholder = `\${${field.key}}`
  batchSmsContent.value = (batchSmsContent.value || '') + placeholder
}

const applySmsTemplate = (content: string) => {
  batchSmsContent.value = content
  ElMessage.success('模板已应用')
}

const sendBatchSMS = async () => {
  isSending.value = true
  if (!batchSmsContent.value.trim()) {
    ElMessage.warning('请输入短信内容')
    isSending.value = false
    return
  }

  const targetsToSend = selectedReservoirs.value.filter((r: StationData) =>
    checkedReservoirCodes.value.includes(r._uid!)
  )

  if (!targetsToSend.length) {
    ElMessage.warning('请至少选择一个预警对象')
    isSending.value = false
    return
  }

  if (targetsToSend.length === 1 && !batchSmsTargets.value.length) {
    ElMessage.warning('请选择短信发送对象')
    isSending.value = false
    return
  }

  try {
    const total = targetsToSend.length
    let success = 0
    let fail = 0
    const successDetails: string[] = []

    for (let i = 0; i < total; i++) {
      const r = targetsToSend[i]
      const targets = r.selectedContacts || []

      if (targets.length === 0) {
        fail++
        continue
      }

      const content = getPreviewContent(r)
      ElMessage.info(`正在发送 ${i + 1}/${total}...`)

      const getSuccessMsg = () => {
        const allContacts = getReservoirContactList(r)
        const targetNames = targets.map((phone: string) => {
          const c = allContacts.find((contact: ContactInfo) => contact.FZRDH === phone)
          return c && c.FZRXM ? c.FZRXM : phone
        })
        return `${r.NAME}(${targetNames.join('、')})`
      }

      try {
        await sendSms(targets.join(','), content)
        success += targets.length
        successDetails.push(getSuccessMsg())
      } catch {
        fail += targets.length
      }
    }

    const detailMsg =
      successDetails.length > 0 ? `\n成功发送详情：${successDetails.join('；')}。` : ''

    if (fail === 0) {
      ElMessage.success(`发送成功 ${success} 条`)
      messages.value.push({
        role: 'ai',
        content: `已成功发送 ${success} 条短信。${detailMsg}`,
      })
      batchSmsDialogVisible.value = false

      if (
        typeof currentSmsMessageIndex.value === 'number' &&
        messages.value[currentSmsMessageIndex.value]
      ) {
        messages.value[currentSmsMessageIndex.value].actions?.forEach((a: MessageAction) => (a.disabled = true))
        currentSmsMessageIndex.value = null
      }
    } else {
      ElMessage.warning(`发送完成：成功 ${success}，失败 ${fail}`)
      messages.value.push({
        role: 'ai',
        content: `发送完成：成功 ${success}，失败 ${fail}。${detailMsg}`,
      })
    }
    hasSent.value = true
    isSending.value = false
    scrollToBottom()
  } catch {
    ElMessage.error('发送失败')
    isSending.value = false
  }
}

const handleEnter = (e: KeyboardEvent) => {
  if (!e.shiftKey) {
    sendMessage()
  }
}

const executeClientAction = (actionData: { action?: string; params?: Record<string, unknown> }, msgIndex: number) => {
  const action = actionData.action
  const params = actionData.params || {}

  const actionHandlers: Record<string, (action: string, params: Record<string, unknown>, msgIndex: number) => void> = {
    query_water_level: handleQueryWaterLevel,
    query_station_list: handleQueryWaterLevel,
    query_rainfall: handleQueryRainfall,
    query_water_process: handleQueryWaterProcess,
  }

  const handler = action ? actionHandlers[action] : null
  if (handler) {
    handler(action!, params, msgIndex)
  } else {
    console.warn(`Unknown action: ${action}`)
  }
}

const handleQueryWaterLevel = async (
  action: string,
  params: Record<string, unknown>,
  msgIndex: number
) => {
  const runLocalLogic = () => {
    let localTableData =
      tableData.value && tableData.value.length > 0
        ? tableData.value
        : [
            { NAME: '大凼水库', RZ: '26.5', XXSW: '26.0', BNSTCD: 'RHC020037', TP: '水库' },
            { NAME: '白石水库', RZ: '18.2', XXSW: '19.0', BNSTCD: 'RHC020038', TP: '水库' },
            { NAME: '茅洲河', RZ: '3.5', XXSW: '5.0', BNSTCD: '4403000001', TP: '河道' },
          ]

    let filtered = localTableData

    if (params.station_codes && (params.station_codes as string[]).length > 0) {
      filtered = localTableData.filter((item: StationData) =>
        (params.station_codes as string[]).includes(item.BNSTCD)
      )
    } else if (params.station_code) {
      filtered = localTableData.filter((item: StationData) => item.BNSTCD === params.station_code)
    } else if (params.station_names && (params.station_names as string[]).length > 0) {
      filtered = localTableData.filter((item: StationData) => {
        return (params.station_names as string[]).some((name: string) => item.NAME.includes(name))
      })
    } else if (params.station_name) {
      filtered = localTableData.filter((item: StationData) => item.NAME.includes(params.station_name as string))
    } else if (params.keyword) {
      filtered = localTableData.filter((item: StationData) => item.NAME.includes(params.keyword as string))
    }

    if (params.type) {
      const typeMap: Record<string, string> = {
        reservoir: '水库',
        river: '河道',
        ponding: '积涝点',
      }
      const targetType = typeMap[params.type as string]
      if (targetType) {
        filtered = filtered.filter(
          (item: StationData) => item.TP === targetType || (item.TP && item.TP.includes(targetType))
        )
      }
    }

    if (filtered.length === 0) {
      messages.value[msgIndex].content = `未找到符合条件的数据。`
      return
    }

    const displayData = filtered.slice(0, 10)

    messages.value[msgIndex].content =
      action === 'query_station_list'
        ? `为您找到 ${filtered.length} 个相关站点：`
        : '为您查询到以下站点的水位数据：'

    messages.value[msgIndex].type = 'table'
    messages.value[msgIndex].columns = [
      { prop: 'NAME', label: '名称' },
      { prop: 'RZ', label: '水位(m)' },
      { prop: 'XXSW', label: '汛限/警戒水位(m)' },
      { prop: 'TM', label: '监测时间' },
    ]
    messages.value[msgIndex].data = displayData
    scrollToBottom()
  }

  if (params.station_codes && (params.station_codes as string[]).length > 0) {
    try {
      const rawData = await fetchStationWaterLevel(params.station_codes as string[], params.time as string)

      if (rawData.length > 0) {
        const displayData = rawData.slice(0, 10).map((item: StationData) => {
          let tmStr = ''
          if (item.TM) {
            if (typeof item.TM === 'object' && (item.TM as { time: number }).time) {
              const date = new Date((item.TM as { time: number }).time)
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              const hours = String(date.getHours()).padStart(2, '0')
              const minutes = String(date.getMinutes()).padStart(2, '0')
              const seconds = String(date.getSeconds()).padStart(2, '0')
              tmStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
            } else if (typeof item.TM === 'string') {
              tmStr = item.TM
            }
          }

          return {
            NAME: (item.STNM as string) || item.NAME,
            RZ: (item.SW as string) || item.RZ,
            XXSW: (item.FXSW as string) || item.XXSW,
            BNSTCD: (item.STCD as string) || item.BNSTCD,
            TP: item.TP,
            TM: tmStr,
          }
        })

        messages.value[msgIndex].content =
          action === 'query_station_list'
            ? `为您找到 ${rawData.length} 个相关站点：`
            : '为您查询到以下站点的水位数据：'

        messages.value[msgIndex].type = 'table'
        messages.value[msgIndex].columns = [
          { prop: 'NAME', label: '名称' },
          { prop: 'RZ', label: '水位(m)' },
          { prop: 'XXSW', label: '汛限/警戒水位(m)' },
          { prop: 'TM', label: '监测时间' },
        ]
        messages.value[msgIndex].data = displayData
        scrollToBottom()
      } else {
        runLocalLogic()
      }
    } catch {
      runLocalLogic()
    }
  } else {
    runLocalLogic()
  }
}

const handleQueryRainfall = (_action: string, _params: Record<string, unknown>, msgIndex: number) => {
  messages.value[msgIndex].content = '未来 24 小时降雨量趋势预测如下：'
  messages.value[msgIndex].type = 'chart'
  const chartOption = {
    grid: { top: 30, bottom: 20, left: 30, right: 10, containLabel: true },
    xAxis: { type: 'category', data: ['08:00', '12:00', '16:00', '20:00', '00:00', '04:00'] },
    yAxis: { type: 'value', name: 'mm' },
    series: [
      {
        data: [0, 2.5, 15, 8.2, 0.5, 0],
        type: 'bar',
        itemStyle: { color: '#409eff' },
      },
    ],
  }
  messages.value[msgIndex].chartOption = chartOption

  nextTick(() => {
    const chartDom = document.getElementById('chart-' + msgIndex)
    if (chartDom) {
      const myChart = echarts.init(chartDom)
      myChart.setOption(chartOption)
    }
  })
}

const handleQueryWaterProcess = async (
  _action: string,
  params: Record<string, unknown>,
  msgIndex: number
) => {
  try {
    const rawData = await fetchWaterProcess(
      params['query.bh'] as string,
      params['query.beginDate'] as string,
      params['query.endDate'] as string
    )

    if (rawData.length > 0) {
      const stationName = rawData[0].STNM || '测站'
      const warningLevel = rawData[0].FXSW || 0

      const timeData: string[] = []
      const waterLevelData: number[] = []

      rawData.forEach((item) => {
        let timeStr = ''
        if (item.TM && typeof item.TM === 'object' && item.TM.time) {
          const date = new Date(item.TM.time)
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          timeStr = `${month}-${day} ${hours}:${minutes}`
        } else if (item.TM && typeof item.TM === 'string') {
          timeStr = item.TM
        }

        timeData.push(timeStr)
        waterLevelData.push(item.RZ || 0)
      })

      messages.value[msgIndex].content = `${stationName} 水位变化过程：`
      messages.value[msgIndex].type = 'chart'

      const chartOption: Record<string, unknown> = {
        title: {
          text: `${stationName}水位过程线`,
          left: 'center',
          top: 10,
          textStyle: { fontSize: 14, fontWeight: 'normal' },
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params: unknown[]) => {
            const data = params[0] as { name: string; value: number }
            return `${data.name}<br/>水位: ${data.value} m`
          },
        },
        grid: { top: 80, bottom: 100, left: 70, right: 50, containLabel: true },
        xAxis: {
          type: 'category',
          data: timeData,
          axisLabel: { rotate: 45, interval: Math.floor(timeData.length / 10) || 0 },
        },
        yAxis: { type: 'value', name: '水位(m)', scale: true },
        series: [
          {
            name: '水位',
            data: waterLevelData,
            type: 'line',
            smooth: true,
            itemStyle: { color: '#409eff' },
            lineStyle: { width: 2 },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                  { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
                ],
              },
            },
          },
        ],
      }

      if (warningLevel && warningLevel > 0) {
        (chartOption.series as unknown[]).push({
          name: '警戒水位',
          type: 'line',
          markLine: {
            silent: true,
            data: [
              {
                yAxis: warningLevel,
                label: { position: 'end', formatter: `警戒水位: ${warningLevel}m` },
                lineStyle: { color: '#ff4d4f', type: 'dashed', width: 2 },
              },
            ],
          },
        })
      }

      messages.value[msgIndex].chartOption = chartOption
      nextTick(() => {
        const chartDom = document.getElementById('chart-' + msgIndex)
        if (chartDom) {
          const myChart = echarts.init(chartDom)
          myChart.setOption(chartOption)
        }
      })
      scrollToBottom()
    } else {
      messages.value[msgIndex].content = `未找到符合条件的水位过程数据。`
    }
  } catch {
    messages.value[msgIndex].content = `查询水位过程数据失败，请稍后重试。`
  }
}

const sendMessage = async () => {
  const content = inputMessage.value.trim()
  if (!content) return

  messages.value.push({ role: 'user', content })
  inputMessage.value = ''
  scrollToBottom()
  loading.value = true

  const aiMsgIndex =
    messages.value.push({
      role: 'ai',
      content: '...',
    }) - 1

  let currentContent = ''

  const responseText = await callCozeApi(content, (chunk: string) => {
    if (currentContent === '') {
      messages.value[aiMsgIndex].content = ''
      loading.value = false
    }
    currentContent += chunk

    if (currentContent.trim().startsWith('{') && currentContent.includes('"action"')) {
      messages.value[aiMsgIndex].content = '正在分析您的请求...'
    } else {
      messages.value[aiMsgIndex].content = currentContent
    }

    scrollToBottom()
  })

  loading.value = false

  if (!responseText) {
    messages.value[aiMsgIndex].content = '抱歉，暂无可用的模型，请检查网络或Token配置。'
    scrollToBottom()
    return
  }

  let actionData: { action?: string; params?: Record<string, unknown> } | null = null
  let displayContent = responseText

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*"action"[\s\S]*\}/)

    if (jsonMatch) {
      try {
        actionData = JSON.parse(jsonMatch[0])
      } catch {
        console.log('JSON parse error')
      }
    } else {
      if (responseText.trim().startsWith('{')) {
        actionData = JSON.parse(responseText)
      }
    }
  } catch {
    // Not a valid JSON action
  }

  if (actionData && actionData.action) {
    messages.value[aiMsgIndex].content = '正在为您查询数据...'
    executeClientAction(actionData, aiMsgIndex)
  } else {
    let msgData: { content?: string; type?: string; columns?: unknown[]; data?: unknown[]; chartOption?: unknown } | null = null
    try {
      const jsonMatch =
        responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/```\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        msgData = JSON.parse(jsonMatch[1])
        if (msgData?.content) displayContent = msgData.content
      } else {
        msgData = JSON.parse(responseText)
        if (msgData?.content) displayContent = msgData.content
      }
    } catch {}

    if (msgData && msgData.type) {
      messages.value[aiMsgIndex].content = displayContent
      messages.value[aiMsgIndex].type = msgData.type as 'table' | 'chart'
      if (msgData.type === 'table') {
        messages.value[aiMsgIndex].columns = msgData.columns as { prop: string; label: string; width?: number }[]
        messages.value[aiMsgIndex].data = msgData.data as StationData[]
      } else if (msgData.type === 'chart') {
        messages.value[aiMsgIndex].chartOption = msgData.chartOption as Record<string, unknown>
        nextTick(() => {
          const chartDom = document.getElementById('chart-' + aiMsgIndex)
          if (chartDom) {
            const myChart = echarts.init(chartDom)
            myChart.setOption(msgData!.chartOption as Record<string, unknown>)
          }
        })
      }
    }
  }
  scrollToBottom()
}

const clearHistory = () => {
  ElMessageBox.confirm('确定要清空对话历史吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      messages.value = []
    })
    .catch(() => {})
}

const openMobilePage = () => {
  if (sessionId.value) {
    window.open(`/#/mobile/${sessionId.value}`, '_blank')
  }
}

const initQRCode = async () => {
  try {
    sessionId.value = crypto.randomUUID()
    
    const host = window.location.host
    const protocol = window.location.protocol
    const mobileUrl = `${protocol}//${host}/#/mobile/${sessionId.value}`
    
    const QRCode = (await import('qrcode')).default
    qrDataUrl.value = await QRCode.toDataURL(mobileUrl, {
      width: 200,
      margin: 2,
    })
    
    await axios.post('/api/mobile/session', { sessionId: sessionId.value })
    initSSE()
  } catch (error) {
    console.error('Failed to generate QR code:', error)
  }
}

const initSSE = () => {
  if (!sessionId.value) return
  
  eventSource = new EventSource(`/api/mobile/sse/${sessionId.value}`)
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)
    
    if (data.type === 'mobile_connected') {
      mobileConnected.value = true
      qrDataUrl.value = ''
      ElMessage.success('手机已连接')
    } else if (data.type === 'message') {
      inputMessage.value = data.content
      sendMessage()
    }
  }
  
  eventSource.onerror = (error) => {
    console.error('SSE connection error:', error)
    eventSource?.close()
  }
}

onMounted(async () => {
  scrollToBottom()
  await initQRCode()
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
})
</script>

<style scoped>
.chat-container {
  --border-color: var(--border-color, #e4e7ed);
  --border-color-light: var(--border-color, #ebeef5);
  --border-active: var(--primary-color, #409eff);
  --text-primary: var(--text-color, #303133);
  --text-secondary: var(--text-secondary, #909399);
  --text-white: var(--btn-primary-text, #fff);
  --text-placeholder: var(--text-secondary, #c0c4cc);
  --bg-card: var(--card-bg, #fff);
  --bg-secondary: var(--hover-bg, #f5f7fa);
  --bg-tertiary: var(--border-color, #e4e7ed);
  --bg-hover: var(--hover-bg, #f5f7fa);
  --bg-input: var(--input-bg, #fff);
  --accent-color: var(--primary-color, #409eff);
  --success-color: var(--success-color, #67c23a);
  --scrollbar-thumb: var(--scrollbar-thumb, rgba(0, 0, 0, 0.2));
  --scrollbar-track: var(--scrollbar-track, rgba(0, 0, 0, 0.05));
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.chat-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  background: transparent;
}

.chat-header {
  height: 60px;
  line-height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: transparent;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  flex-shrink: 0;
  color: var(--text-white);
}

.user-message .message-avatar {
  background-color: var(--accent-color);
}

.ai-message .message-avatar {
  background-color: var(--success-color);
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
  position: relative;
}

.user-message .message-content {
  background-color: var(--accent-color);
  color: var(--text-white);
  border-top-right-radius: 2px;
}

.ai-message .message-content {
  background-color: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-top-left-radius: 2px;
}

.ai-message .message-content:has(.chart-container) {
  max-width: 90%;
  padding: 12px 16px;
}

.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 20px;
}

.welcome-icon {
  background: rgba(103, 194, 58, 0.2);
  padding: 15px;
  border-radius: 50%;
  margin-bottom: 10px;
  color: var(--success-color);
}

.welcome-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 10px;
  margin-top: 20px;
}

.welcome-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 40px;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  width: 100%;
  max-width: 600px;
}

.suggestion-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.suggestion-card:hover {
  background-color: var(--bg-hover);
  border-color: var(--accent-color);
}

.suggestion-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.4;
}

.suggestion-icon {
  color: var(--accent-color);
  margin-bottom: 8px;
  font-size: 18px;
}

.input-area {
  padding: 20px;
  border-top: 1px solid var(--border-color);
  background-color: transparent;
}

.input-wrapper {
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px;
  transition: border-color 0.2s;
  background-color: var(--bg-input);
}

.input-wrapper:focus-within {
  border-color: var(--border-active);
}

.chat-textarea :deep(textarea) {
  border: none !important;
  resize: none !important;
  padding: 0;
  box-shadow: none !important;
  background: transparent !important;
  color: var(--text-primary) !important;
}

.chat-textarea :deep(textarea:focus) {
  outline: none;
}

.chat-textarea :deep(textarea::placeholder) {
  color: var(--text-placeholder) !important;
}

.send-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
}

.message-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  border-top: 1px solid var(--border-color-light);
  padding-top: 12px;
}

.chart-container {
  width: 100%;
  min-width: 600px;
  height: 400px;
  margin-top: 10px;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  padding: 10px;
}

.table-container {
  margin-top: 10px;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.preview-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 10px;
  background-color: var(--bg-secondary);
}

.preview-item {
  margin-bottom: 15px;
  padding: 10px;
  background: var(--bg-card);
  border-radius: 4px;
  border-left: 3px solid var(--accent-color);
  color: var(--text-primary);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}

.qrcode-section {
  margin: 30px 0;
  text-align: center;
}

.qrcode-container {
  display: inline-block;
  padding: 15px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.qrcode-image {
  width: 200px;
  height: 200px;
}

.qrcode-loading {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-secondary);
}

.qrcode-tip {
  margin-top: 15px;
  font-size: 14px;
  color: var(--text-secondary);
}

.test-btn {
  margin-top: 10px;
}

.mobile-connected-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 25px;
  background: rgba(103, 194, 58, 0.1);
  border-radius: 8px;
  margin: 20px 0;
  color: var(--success-color);
  font-size: 16px;
}
</style>
