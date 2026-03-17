'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn, formatDate, truncate } from '@/lib/utils'

export function ChatHistorySidebar() {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    deleteConversation,
    chatSidebarCollapsed,
    toggleChatSidebar,
    setActivePage,
  } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNewChat = () => {
    const id = createConversation()
    setActivePage('chat')
    setActiveConversation(id)
  }

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id)
    setActivePage('chat')
  }

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, conv) => {
    const label = formatDate(conv.updatedAt)
    if (!acc[label]) acc[label] = []
    acc[label].push(conv)
    return acc
  }, {})

  if (chatSidebarCollapsed) {
    return (
      <div className="flex flex-col items-center py-4 gap-3 w-[56px] border-r border-[var(--border)] bg-[var(--surface-elevated)] flex-shrink-0">
        <button
          onClick={handleNewChat}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-glow-sm"
          title="New chat"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={toggleChatSidebar}
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          title="Expand sidebar"
        >
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
        <div className="w-px h-4 bg-[var(--border)]" />
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-160px)]">
          {conversations.slice(0, 10).map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectConversation(c.id)}
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200',
                activeConversationId === c.id
                  ? 'bg-brand-600/20 text-brand-500'
                  : 'hover:bg-[var(--surface-overlay)] text-[var(--text-muted)]'
              )}
              title={c.title}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: 280 }}
      className="flex flex-col h-full border-r border-[var(--border)] bg-[var(--surface-elevated)] flex-shrink-0"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-[var(--border)] flex-shrink-0">
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 flex-1 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 text-sm font-medium transition-colors duration-200 shadow-glow-sm"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <span>New Chat</span>
        </button>
        <button
          onClick={toggleChatSidebar}
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 flex-shrink-0">
        <div className="flex items-center gap-2 bg-[var(--surface-overlay)] rounded-xl px-3 py-2">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-overlay)] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)] text-center">
              {searchQuery ? 'No results found' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleNewChat}
                className="text-xs text-brand-500 hover:text-brand-400 transition-colors"
              >
                Start a new chat
              </button>
            )}
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, convs]) => (
            <div key={dateLabel} className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] px-2 mb-1">
                {dateLabel}
              </p>
              <AnimatePresence>
                {convs.map((conv) => (
                  <motion.div
                    key={conv.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="relative group"
                    onMouseEnter={() => setHoveredId(conv.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <button
                      onClick={() => handleSelectConversation(conv.id)}
                      className={cn(
                        'w-full flex items-start gap-2.5 px-2 py-2 rounded-xl text-left transition-all duration-150',
                        activeConversationId === conv.id
                          ? 'bg-brand-600/15 border border-brand-600/20'
                          : 'hover:bg-[var(--surface-overlay)]'
                      )}
                    >
                      <MessageSquare
                        className={cn(
                          'w-3.5 h-3.5 flex-shrink-0 mt-0.5',
                          activeConversationId === conv.id
                            ? 'text-brand-500'
                            : 'text-[var(--text-muted)]'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-xs font-medium leading-tight truncate',
                            activeConversationId === conv.id
                              ? 'text-brand-400'
                              : 'text-[var(--text-primary)]'
                          )}
                        >
                          {truncate(conv.title, 36)}
                        </p>
                        {conv.messages.length > 0 && (
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">
                            {truncate(
                              conv.messages[conv.messages.length - 1].content,
                              40
                            )}
                          </p>
                        )}
                      </div>
                    </button>

                    {/* Actions */}
                    {hoveredId === conv.id && (
                      <div className="absolute right-2 top-2 flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteConversation(conv.id)
                          }}
                          className="flex items-center justify-center w-6 h-6 rounded-lg bg-[var(--surface-elevated)] hover:bg-red-500/20 hover:text-red-400 text-[var(--text-muted)] transition-all duration-150"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <button className="flex items-center justify-center w-6 h-6 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-overlay)] text-[var(--text-muted)] transition-all duration-150">
                          <MoreHorizontal className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}
