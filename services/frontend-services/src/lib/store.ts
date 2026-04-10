import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

export type MessageRole = 'user' | 'assistant' | 'system'

// ── User Management ─────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  role: 'Administrator' | 'Analyst' | 'Viewer'
  avatar?: string  // URL or initials
  createdAt: Date
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: Date
  duration?: number  // milliseconds, undefined = persistent
  read: boolean
}

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

  // User Management
  users: User[]
  currentUserId: string | null

  // Notifications (per-user, keyed by userId)
  userNotifications: Record<string, Notification[]>

  // Theme & UI
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setChatSidebarCollapsed: (collapsed: boolean) => void
  toggleChatSidebar: () => void
  setActivePage: (page: AppState['activePage']) => void
  setActiveConversation: (id: string | null) => void
  setSelectedModel: (modelId: string) => void

  // Conversations
  createConversation: () => string
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void
  updateConversationTitle: (id: string, title: string) => void
  deleteConversation: (id: string) => void

  // User Management Actions
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => string
  updateUser: (id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) => void
  deleteUser: (id: string) => void
  setCurrentUser: (id: string | null) => void
  getCurrentUser: () => User | null

  // Notification Actions (per-user)
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => string
  removeNotification: (id: string) => void
  markNotificationRead: (id: string) => void
  clearAllNotifications: () => void
  getUserNotifications: (userId?: string) => Notification[]
  getUnreadCount: (userId?: string) => number
}

const generateId = () => Math.random().toString(36).substring(2, 11)

// Default users for initial state
const createDefaultUser = (): User => ({
  id: generateId(),
  name: 'John Doe',
  email: 'john.doe@company.com',
  role: 'Administrator',
  avatar: 'JD',
  createdAt: new Date(),
})

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const defaultUser = createDefaultUser()
      
      return {
        theme: 'dark',
        sidebarCollapsed: false,
        chatSidebarCollapsed: false,
        activeConversationId: null,
        conversations: [],
        activePage: 'dashboard',
        selectedModel: 'gemini-3-flash-preview',

        // User Management
        users: [defaultUser],
        currentUserId: defaultUser.id,

        // Notifications per user
        userNotifications: {},

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

      // ── User Management ─────────────────────────────────────────────────────

      addUser: (userData) => {
        const id = generateId()
        const newUser: User = {
          ...userData,
          id,
          createdAt: new Date(),
        }
        set((s) => ({ users: [...s.users, newUser] }))
        return id
      },

      updateUser: (id, updates) => {
        set((s) => ({
          users: s.users.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        }))
      },

      deleteUser: (id) => {
        set((s) => {
          const remaining = s.users.filter((u) => u.id !== id)
          // If deleting current user, switch to first available or null
          const newCurrentId = s.currentUserId === id
            ? remaining[0]?.id ?? null
            : s.currentUserId
          return {
            users: remaining,
            currentUserId: newCurrentId,
          }
        })
      },

      setCurrentUser: (id) => {
        set({ currentUserId: id })
      },

      getCurrentUser: () => {
        const { users, currentUserId } = get()
        if (!currentUserId) return null
        return users.find((u) => u.id === currentUserId) ?? null
      },

      // ── Notifications (Per-User) ─────────────────────────────────────────────

      addNotification: (notificationData) => {
        const id = generateId()
        const notification: Notification = {
          ...notificationData,
          id,
          createdAt: new Date(),
          read: false,
        }
        const currentUserId = get().currentUserId
        if (!currentUserId) return id

        set((s) => ({
          userNotifications: {
            ...s.userNotifications,
            [currentUserId]: [notification, ...(s.userNotifications[currentUserId] || [])].slice(0, 100), // Keep last 100 per user
          },
        }))
        return id
      },

      removeNotification: (id) => {
        const currentUserId = get().currentUserId
        if (!currentUserId) return
        set((s) => ({
          userNotifications: {
            ...s.userNotifications,
            [currentUserId]: (s.userNotifications[currentUserId] || []).filter((n) => n.id !== id),
          },
        }))
      },

      markNotificationRead: (id: string) => {
        const currentUserId = get().currentUserId
        if (!currentUserId) return
        set((state: { userNotifications: Record<string, Notification[]> }) => ({
          userNotifications: {
            ...state.userNotifications,
            [currentUserId]: (state.userNotifications[currentUserId] || []).map((n: Notification) =>
              n.id === id ? { ...n, read: true } : n
            ),
          },
        }))
      },

      clearAllNotifications: () => {
        const currentUserId = get().currentUserId
        if (!currentUserId) return
        set((s) => ({
          userNotifications: {
            ...s.userNotifications,
            [currentUserId]: [],
          },
        }))
      },

      getUserNotifications: (userId?: string) => {
        const targetUserId = userId || get().currentUserId
        if (!targetUserId) return []
        return get().userNotifications[targetUserId] || []
      },

      getUnreadCount: (userId?: string) => {
        const targetUserId = userId || get().currentUserId
        if (!targetUserId) return 0
        const notifications = get().userNotifications[targetUserId] || []
        return notifications.filter((n) => !n.read).length
      },
    }},
    {
      name: 'insurguard-app-state',
      partialize: (s) => ({
        theme: s.theme,
        conversations: s.conversations,
        activeConversationId: s.activeConversationId,
        sidebarCollapsed: s.sidebarCollapsed,
        selectedModel: s.selectedModel,
        users: s.users,
        currentUserId: s.currentUserId,
        userNotifications: s.userNotifications, // Persist notifications per user
      }),
    }
  )
)
