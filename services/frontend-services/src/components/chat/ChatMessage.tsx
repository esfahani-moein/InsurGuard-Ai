'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Shield, User, Copy, Check, FileText, ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Message } from '@/lib/store'

interface ChatMessageProps {
  message: Message
  index: number
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-dot"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
  )
}

export function ChatMessage({ message, index }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 mt-1',
          isUser
            ? 'bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow-sm'
            : 'bg-[var(--surface-overlay)] border border-[var(--border)]'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Shield className="w-4 h-4 text-brand-400" />
        )}
      </div>

      {/* Bubble */}
      <div className={cn('flex flex-col gap-1 max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'relative rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-brand-600 text-white rounded-tr-sm'
              : 'bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-sm'
          )}
        >
          {message.isStreaming ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1.5 prose-pre:my-2 prose-code:text-brand-400 prose-headings:font-display prose-headings:font-semibold">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-xl !text-xs !my-2"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-[var(--surface-overlay)] px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={cn('flex flex-wrap gap-2', isUser ? 'justify-end' : 'justify-start')}>
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 bg-[var(--surface-overlay)] border border-[var(--border)] rounded-xl px-3 py-2"
              >
                {att.type.startsWith('image/') ? (
                  att.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={att.thumbnailUrl} alt={att.name} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-[var(--text-muted)]" />
                  )
                ) : (
                  <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                )}
                <span className="text-xs text-[var(--text-secondary)] max-w-[120px] truncate">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Copy action */}
        {!isUser && !message.isStreaming && message.content && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors opacity-0 group-hover:opacity-100"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  )
}
