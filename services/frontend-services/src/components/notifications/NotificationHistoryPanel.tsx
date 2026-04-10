'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Bell,
  Trash2,
  CheckCheck,
  Clock,
} from 'lucide-react'
import { useAppStore, type Notification, type NotificationType } from '@/lib/store'
import { cn, formatRelativeTime } from '@/lib/utils'

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

interface NotificationHistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement | null>
  placement?: 'bottom-left' | 'bottom-right' | 'top-right'
}

export function NotificationHistoryPanel({
  isOpen,
  onClose,
  triggerRef,
  placement = 'bottom-right',
}: NotificationHistoryPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const {
    getUserNotifications,
    getUnreadCount,
    markNotificationRead,
    removeNotification,
    clearAllNotifications,
    currentUserId,
  } = useAppStore()

  const notifications = getUserNotifications()
  const unreadCount = getUnreadCount()

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, triggerRef])

  // Mark all as read when opening
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      notifications
        .filter((n) => !n.read)
        .forEach((n) => markNotificationRead(n.id))
    }
  }, [isOpen, notifications, unreadCount, markNotificationRead])

  const placementClasses = {
    'bottom-left': 'left-0 mt-2',
    'bottom-right': 'right-0 mt-2',
    'top-right': 'right-0 mb-2 bottom-full',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: placement === 'top-right' ? 8 : -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: placement === 'top-right' ? 8 : -8, scale: 0.95 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'absolute z-50 w-96 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden',
            placementClasses[placement]
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--text-muted)]" />
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-brand-500/20 text-brand-400 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={() => {
                      notifications.forEach((n) => markNotificationRead(n.id))
                    }}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="w-10 h-10 text-[var(--text-muted)]/30 mb-3" />
                <p className="text-sm text-[var(--text-muted)]">No notifications yet</p>
                <p className="text-xs text-[var(--text-muted)]/70 mt-1">
                  New notifications will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={() => markNotificationRead(notification.id)}
                    onRemove={() => removeNotification(notification.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface)]/50">
              <p className="text-[11px] text-[var(--text-muted)] text-center">
                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface NotificationItemProps {
  notification: Notification
  onMarkRead: () => void
  onRemove: () => void
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const Icon = icons[notification.type]
  const color = colors[notification.type]

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-4 hover:bg-[var(--surface-overlay)] transition-colors',
        !notification.read && 'bg-brand-500/5'
      )}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 mt-0.5', color.icon)}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-sm font-medium text-[var(--text-primary)]',
            !notification.read && 'font-semibold'
          )}>
            {notification.title}
          </p>
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--text-muted)] hover:text-red-400 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        {notification.message && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
            {notification.message}
          </p>
        )}
        <div className="flex items-center gap-1 mt-2">
          <Clock className="w-3 h-3 text-[var(--text-muted)]" />
          <span className="text-[10px] text-[var(--text-muted)]">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="flex-shrink-0 w-2 h-2 mt-1.5 bg-brand-500 rounded-full" />
      )}
    </div>
  )
}
