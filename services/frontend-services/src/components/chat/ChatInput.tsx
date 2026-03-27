'use client'

import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Send,
  Paperclip,
  ImageIcon,
  X,
  FileText,
  StopCircle,
} from 'lucide-react'
import { cn, formatFileSize, generateId } from '@/lib/utils'
import type { Attachment } from '@/lib/store'

export interface PendingChatAttachment extends Attachment {
  file: File
}

interface ChatInputProps {
  onSend: (content: string, attachments: PendingChatAttachment[]) => void | Promise<void>
  disabled?: boolean
  placeholder?: string
}

interface PendingFile {
  id: string
  file: File
  preview?: string
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles: PendingFile[] = accepted.map((file) => ({
      id: generateId(),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))
    setPendingFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'text/*': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
    },
  })

  const handleAutoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  const removeFile = (id: string) => {
    setPendingFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.preview) URL.revokeObjectURL(file.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  const handleSend = async () => {
    const trimmed = value.trim()
    if (!trimmed && pendingFiles.length === 0) return

    const attachments: PendingChatAttachment[] = pendingFiles.map((pf) => ({
      id: pf.id,
      name: pf.file.name,
      type: pf.file.type,
      size: pf.file.size,
      url: pf.preview || '',
      thumbnailUrl: pf.preview,
      file: pf.file,
    }))

    try {
      await onSend(trimmed, attachments)
      pendingFiles.forEach((pf) => {
        if (pf.preview) URL.revokeObjectURL(pf.preview)
      })
      setValue('')
      setPendingFiles([])
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Failed to send message with attachments', error)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const canSend = (value.trim().length > 0 || pendingFiles.length > 0) && !disabled

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border border-[var(--border)] rounded-2xl bg-[var(--surface-elevated)] transition-all duration-200',
        isDragActive && 'border-brand-500 bg-brand-600/5 shadow-glow-sm'
      )}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl flex items-center justify-center bg-brand-600/10 border-2 border-dashed border-brand-500 z-10 pointer-events-none"
          >
            <p className="text-sm font-medium text-brand-400">Drop files here</p>
          </motion.div>
        )}
      </AnimatePresence>

      <input {...getInputProps()} />

      {/* File previews */}
      <AnimatePresence>
        {pendingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 px-4 pt-3"
          >
            {pendingFiles.map((pf) => (
              <motion.div
                key={pf.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative flex items-center gap-2 bg-[var(--surface-overlay)] border border-[var(--border)] rounded-xl px-2.5 py-1.5 group"
              >
                {pf.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pf.preview} alt={pf.file.name} className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-brand-600/15 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-brand-400" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-[var(--text-primary)] truncate max-w-[100px]">
                    {pf.file.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {formatFileSize(pf.file.size)}
                  </span>
                </div>
                <button
                  onClick={() => removeFile(pf.id)}
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-red-400 hover:border-red-400/50 transition-all duration-150"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="flex items-end gap-2 px-4 py-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            handleAutoResize()
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Ask about insurance coverage, policy analysis, legal compliance...'}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none leading-relaxed min-h-[24px] max-h-[200px] overflow-y-auto"
        />

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* File attachment */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-8 h-8 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] transition-all duration-150"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => {
              if (e.target.files) {
                onDrop(Array.from(e.target.files))
                e.target.value = ''
              }
            }}
          />

          {/* Image attachment */}
          <button
            className="flex items-center justify-center w-8 h-8 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] transition-all duration-150"
            title="Attach image"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.multiple = true
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files
                if (files) onDrop(Array.from(files))
              }
              input.click()
            }}
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Send / Stop */}
          <motion.button
            onClick={() => void handleSend()}
            disabled={!canSend}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200',
              canSend
                ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-glow-sm'
                : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] cursor-not-allowed'
            )}
            title="Send message (Enter)"
          >
            {disabled ? <StopCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 pb-2.5 flex items-center justify-between">
        <p className="text-[10px] text-[var(--text-muted)]">
          Press <kbd className="font-mono bg-[var(--surface-overlay)] px-1 py-0.5 rounded text-[10px]">Enter</kbd> to send,{' '}
          <kbd className="font-mono bg-[var(--surface-overlay)] px-1 py-0.5 rounded text-[10px]">Shift+Enter</kbd> for new line
        </p>
        {value.length > 0 && (
          <span className="text-[10px] text-[var(--text-muted)]">{value.length}</span>
        )}
      </div>
    </div>
  )
}
