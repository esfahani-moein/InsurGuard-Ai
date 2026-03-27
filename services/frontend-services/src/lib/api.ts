import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error?.response?.data || error.message)
    return Promise.reject(error)
  }
)

export interface ChatRequest {
  message: string
  conversation_id?: string
  attachments?: Array<{ name: string; type: string; content: string }>
  model?: string
}

export interface GeminiModel {
  id: string
  name: string
  description: string
  is_default: boolean
}

export interface ModelsResponse {
  models: GeminiModel[]
  default: string
}

export interface ChatResponse {
  id: string
  conversation_id: string
  message: string
  created_at: string
}

export interface DashboardStats {
  total_documents: number
  total_queries: number
  coverage_checks: number
  risk_assessments: number
  avg_response_time_ms: number
  accuracy_rate: number
  recent_activity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'query' | 'upload' | 'analysis' | 'export'
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error'
}

export const chatApi = {
  sendMessage: async (payload: ChatRequest): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>('/api/chat', payload)
    return data
  },

  streamMessage: async (
    payload: ChatRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Chat stream request failed with status ${response.status}`)
    }

    if (!response.body) throw new Error('No response body')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter((line) => line.startsWith('data: '))
      for (const line of lines) {
        const data = line.replace('data: ', '')
        if (data === '[DONE]') return
        let parsed: { content?: string; error?: string } | null = null
        try {
          parsed = JSON.parse(data)
        } catch {
          onChunk(data)
          continue
        }
        if (!parsed) {
          continue
        }
        if (parsed.error) {
          throw new Error(parsed.error)
        }
        if (parsed.content) {
          onChunk(parsed.content)
        }
      }
    }
  },
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>('/api/dashboard/stats')
    return data
  },
}

export const modelsApi = {
  getModels: async (): Promise<ModelsResponse> => {
    const { data } = await apiClient.get<ModelsResponse>('/api/models')
    return data
  },
}

export const uploadApi = {
  uploadFile: async (file: File): Promise<{ url: string; id: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
