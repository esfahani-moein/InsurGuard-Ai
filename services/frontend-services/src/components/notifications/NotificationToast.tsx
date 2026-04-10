'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useAppStore, type Notification, type NotificationType } from '@/lib/store'
import { cn } from '@/lib/utils'

interface ToastProps {
  notification: Notification
  onClose: (id: string) => void
}

const icons: Record<NotificationType, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
}

const colors: Record<NotificationType, { bg: string; border: string; icon: string }> = {
  info: {
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/30',
    icon: 'text-brand-400',
  },
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-400',
  },
}

function Toast({ notification, onClose }: ToastProps) {
  const Icon = icons[notification.type]
  const color = colors[notification.type]

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onClose(notification.id)
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification.id, notification.duration, onClose])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative flex items-start gap-3 w-full max-w-sm p-4 rounded-xl border shadow-lg backdrop-blur-sm',
        'bg-[var(--surface-elevated)]',
        color.border
      )}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 mt-0.5', color.icon)}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
            {notification.message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onClose(notification.id)}
        className="flex-shrink-0 -mr-1 -mt-1 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar for auto-dismiss */}
      {notification.duration && notification.duration > 0 && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: notification.duration / 1000, ease: 'linear' }}
          className={cn(
            'absolute bottom-0 left-0 right-0 h-0.5 rounded-full origin-left',
            color.icon.replace('text-', 'bg-')
          )}
        />
      )}
    </motion.div>
  )
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useAppStore()

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Toast
              notification={notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
