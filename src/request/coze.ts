const COZE_API_BASE = 'https://api.coze.cn/v3'
const IS_FORBIDDEN_USE_AI = false
const PREFIX_STRING = IS_FORBIDDEN_USE_AI ? 'test_' : ''
const COZE_AGENT_TOKEN = `${PREFIX_STRING}pat_x3HwSeORwBVnDUiM7BurCUJoRpyyDUH7PAQk2nQVVz5SVAUiz0ZsPqBOqcln5x4d`
const COZE_BOT_ID = `${PREFIX_STRING}7615907763818315828`

export interface CozeMessage {
  role: string
  content: string
  content_type: string
}

export async function callCozeApi(
  query: string,
  onChunk?: (chunk: string) => void
): Promise<string | null> {
  const url = `${COZE_API_BASE}/chat`

  const messages: CozeMessage[] = [
    {
      role: 'user',
      content: query,
      content_type: 'text',
    },
  ]

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${COZE_AGENT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bot_id: COZE_BOT_ID,
        user_id: 'user_' + new Date().getTime(),
        stream: true,
        auto_save_history: true,
        additional_messages: messages,
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) return null

    const decoder = new TextDecoder('utf-8')
    let fullContent = ''
    let buffer = ''
    let currentEvent: string | null = null

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine) continue

        if (trimmedLine.startsWith('event:')) {
          currentEvent = trimmedLine.slice(6).trim()
        } else if (trimmedLine.startsWith('data:')) {
          const dataStr = trimmedLine.slice(5).trim()
          if (!dataStr || dataStr === '[DONE]') continue

          try {
            const data = JSON.parse(dataStr)
            if (currentEvent === 'conversation.message.delta') {
              const content = data.content
              if (content) {
                fullContent += content
                if (onChunk) onChunk(content)
              }
            }
          } catch {
            console.error('Parse Error')
          }
        }
      }
    }
    return fullContent
  } catch (error) {
    console.error('Coze API Call Failed:', error)
    return null
  }
}

export function obj2formData(obj: Record<string, unknown>, prefix = ''): FormData {
  const formData = new FormData()
  for (const [key, val] of Object.entries(obj)) {
    if (['', undefined, null].indexOf(val as string | undefined | null) !== -1) {
      continue
    }
    if (Array.isArray(val)) {
      for (const item of val) {
        formData.append(prefix + key, item)
      }
    } else {
      formData.append(prefix + key, val as string)
    }
  }
  return formData
}
