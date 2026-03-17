'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  FileText,
  Bell,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, activePage, setActivePage } = useAppStore()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full bg-[var(--surface-elevated)] border-r border-[var(--border)] overflow-hidden flex-shrink-0 z-20"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 shadow-glow-sm flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="font-display font-bold text-[15px] leading-tight text-[var(--text-primary)] whitespace-nowrap">
                InsurGuard
              </span>
              <span className="text-[11px] text-brand-500 font-mono whitespace-nowrap">
                AI Platform
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                'relative flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group',
                active
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon
                className={cn(
                  'flex-shrink-0 transition-all duration-200',
                  active ? 'w-[18px] h-[18px]' : 'w-[18px] h-[18px] group-hover:scale-110'
                )}
              />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip when collapsed */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[var(--surface-overlay)] text-[var(--text-primary)] text-xs font-medium rounded-lg border border-[var(--border)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-[var(--border)] space-y-1 flex-shrink-0">
        <button className="relative flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)] transition-all duration-200 group">
          <Bell className="w-[18px] h-[18px] flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Notifications
              </motion.span>
            )}
          </AnimatePresence>
          <span className="absolute top-2 left-6 w-2 h-2 bg-brand-500 rounded-full" />
          {sidebarCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[var(--surface-overlay)] text-[var(--text-primary)] text-xs font-medium rounded-lg border border-[var(--border)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
              Notifications
            </div>
          )}
        </button>

        <button className="relative flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)] transition-all duration-200 group">
          <FileText className="w-[18px] h-[18px] flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Documentation
              </motion.span>
            )}
          </AnimatePresence>
          {sidebarCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[var(--surface-overlay)] text-[var(--text-primary)] text-xs font-medium rounded-lg border border-[var(--border)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
              Documentation
            </div>
          )}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-20 z-30 flex items-center justify-center w-7 h-7 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-brand-600 transition-all duration-200 shadow-sm"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </motion.aside>
  )
}
