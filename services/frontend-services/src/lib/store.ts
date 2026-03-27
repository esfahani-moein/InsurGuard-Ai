import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  thumbnailUrl?: string
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  attachments?: Attachment[]
  createdAt: Date
  isStreaming?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface AppState {
  theme: Theme
  sidebarCollapsed: boolean
  chatSidebarCollapsed: boolean
  activeConversationId: string | null
  conversations: Conversation[]
  activePage: 'dashboard' | 'chat' | 'settings' | 'analytics'
  selectedModel: string  // Gemini model ID

  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setChatSidebarCollapsed: (collapsed: boolean) => void
  toggleChatSidebar: () => void
  setActivePage: (page: AppState['activePage']) => void
  setActiveConversation: (id: string | null) => void
  setSelectedModel: (modelId: string) => void
  createConversation: () => string
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void
  updateConversationTitle: (id: string, title: string) => void
  deleteConversation: (id: string) => void
}

const generateId = () => Math.random().toString(36).substring(2, 11)

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      chatSidebarCollapsed: false,
      activeConversationId: null,
      conversations: [],
      activePage: 'dashboard',
      selectedModel: 'gemini-3-flash-preview',

      setTheme: (theme) => {
        set({ theme })
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark')
        }
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        get().setTheme(next)
      },

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setChatSidebarCollapsed: (collapsed) => set({ chatSidebarCollapsed: collapsed }),
      toggleChatSidebar: () => set((s) => ({ chatSidebarCollapsed: !s.chatSidebarCollapsed })),

      setActivePage: (activePage) => set({ activePage }),

      setActiveConversation: (id) => set({ activeConversationId: id }),

      setSelectedModel: (modelId) => set({ selectedModel: modelId }),


      createConversation: () => {
        const id = generateId()
        const now = new Date()
        const conversation: Conversation = {
          id,
          title: 'New conversation',
          messages: [],
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ conversations: [conversation, ...s.conversations], activeConversationId: id }))
        return id
      },

      addMessage: (conversationId, message) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messages: [...c.messages, message], updatedAt: new Date() }
              : c
          ),
        }))
      },

      updateMessage: (conversationId, messageId, updates) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, ...updates } : m
                  ),
                }
              : c
          ),
        }))
      },

      updateConversationTitle: (id, title) => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title } : c
          ),
        }))
      },

      deleteConversation: (id) => {
        set((s) => {
          const remaining = s.conversations.filter((c) => c.id !== id)
          return {
            conversations: remaining,
            activeConversationId:
              s.activeConversationId === id
                ? remaining[0]?.id ?? null
                : s.activeConversationId,
          }
        })
      },
    }),
    {
      name: 'insurguard-app-state',
      partialize: (s) => ({
        theme: s.theme,
        conversations: s.conversations,
        activeConversationId: s.activeConversationId,
        sidebarCollapsed: s.sidebarCollapsed,
        selectedModel: s.selectedModel,
      }),
    }
  )
)
