'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Sparkles } from 'lucide-react'
import { useAppStore, type Attachment, type Message } from '@/lib/store'
import { generateId } from '@/lib/utils'
import { chatApi } from '@/lib/api'
import { ChatMessage } from './ChatMessage'
import { ChatInput, type PendingChatAttachment } from './ChatInput'

const SUGGESTED_PROMPTS = [
  'Analyze the coverage gaps in this policy document',
  'What are the exclusion clauses I should be aware of?',
  'Compare liability coverage across my uploaded policies',
  'Explain the deductible structure in plain language',
  'Check if this policy meets legal compliance standards',
  'Summarize the key risks not covered in this policy',
]

export function ChatInterface() {
  const {
    activeConversationId,
    conversations,
    addMessage,
    updateMessage,
    updateConversationTitle,
    createConversation,
    setActiveConversation,
    selectedModel,
    addNotification,
  } = useAppStore()

  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const streamBufferRef = useRef<string>('')

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  )
  const messages = activeConversation?.messages ?? []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isStreaming])

  const serializeAttachment = async (attachment: PendingChatAttachment) => {
    if (attachment.type.startsWith('text/')) {
      return {
        name: attachment.name,
        type: attachment.type,
        content: await attachment.file.text(),
      }
    }

    return new Promise<{ name: string; type: string; content: string }>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        if (typeof result !== 'string') {
          reject(new Error(`Could not read attachment: ${attachment.name}`))
          return
        }

        const [, base64 = ''] = result.split(',', 2)
        if (!base64) {
          reject(new Error(`Attachment payload was empty: ${attachment.name}`))
          return
        }

        resolve({
          name: attachment.name,
          type: attachment.type,
          content: base64,
        })
      }
      reader.onerror = () => reject(reader.error ?? new Error(`Failed to read attachment: ${attachment.name}`))
      reader.readAsDataURL(attachment.file)
    })
  }

  const handleSend = async (content: string, attachments: PendingChatAttachment[]) => {
    let convId = activeConversationId
    if (!convId) {
      convId = createConversation()
      setActiveConversation(convId)
    }

    const requestMessage = content.trim() || 'Please analyze the attached file(s).'

    const displayAttachments: Attachment[] = attachments.map((attachment) => ({
      id: attachment.id,
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
      url: attachment.url,
      thumbnailUrl: attachment.thumbnailUrl,
    }))

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: requestMessage,
      attachments: displayAttachments.length > 0 ? displayAttachments : undefined,
      createdAt: new Date(),
    }

    addMessage(convId, userMsg)

    // Show sending notification
    addNotification({
      type: 'info',
      title: 'Sending Message',
      message: attachments.length > 0 
        ? `Sending message with ${attachments.length} attachment${attachments.length > 1 ? 's' : ''}...`
        : 'Sending your message...',
      duration: 3000,
    })

    // Update title from first message
    const conv = conversations.find((c) => c.id === convId)
    if (conv && conv.messages.length === 0 && requestMessage.trim()) {
      const title =
        requestMessage.length > 50 ? requestMessage.slice(0, 50) + '…' : requestMessage
      updateConversationTitle(convId, title)
    }

    // Start AI response placeholder
    const assistantMsgId = generateId()
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
      isStreaming: true,
    }
    addMessage(convId, assistantMsg)
    setIsStreaming(true)

    try {
      const apiAttachments = await Promise.all(attachments.map(serializeAttachment))
      streamBufferRef.current = ''
      await chatApi.streamMessage(
        {
          message: requestMessage,
          conversation_id: convId,
          attachments: apiAttachments.length > 0 ? apiAttachments : undefined,
          model: selectedModel,
        },
        (chunk) => {
          streamBufferRef.current += chunk
          updateMessage(convId, assistantMsgId, {
            content: streamBufferRef.current,
            isStreaming: true,
          })
        }
      )
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Response Received',
        message: 'The AI has completed your request.',
        duration: 4000,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send chat request.'
      updateMessage(convId, assistantMsgId, {
        content: `Request failed: ${message}`,
        isStreaming: false,
      })
      // Show error notification
      addNotification({
        type: 'error',
        title: 'Request Failed',
        message: message,
        duration: 5000,
      })
      throw error
    } finally {
      setIsStreaming(false)
      updateMessage(convId, assistantMsgId, { isStreaming: false })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      >
        {messages.length === 0 ? (
          <EmptyState onSuggest={handleSend} />
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage key={msg.id} message={msg} index={i} />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex-shrink-0">
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  )
}

function EmptyState({ onSuggest }: { onSuggest: (content: string, attachments: PendingChatAttachment[]) => void | Promise<void> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4"
    >
      {/* Logo mark */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-brand">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-1">
            InsurGuard AI
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md">
            Your intelligent insurance analysis assistant. Upload policy documents, ask coverage questions, or get compliance insights.
          </p>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="w-full max-w-2xl">
        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 text-center">
          Suggested queries
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <motion.button
              key={prompt}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
              onClick={() => onSuggest(prompt, [])}
              className="flex items-start gap-2.5 text-left px-4 py-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-brand-600/40 hover:bg-brand-600/5 transition-all duration-200 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors leading-snug">
                {prompt}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

