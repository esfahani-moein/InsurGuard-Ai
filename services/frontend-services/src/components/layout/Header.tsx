'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Search, Bell, ChevronDown, User, Settings, LogOut, Plus } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn, truncate } from '@/lib/utils'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview & statistics' },
  chat: { title: 'AI Assistant', subtitle: 'Insurance analysis & queries' },
  analytics: { title: 'Analytics', subtitle: 'Performance insights' },
  settings: { title: 'Settings', subtitle: 'Configure your workspace' },
}

export function Header() {
  const { theme, toggleTheme, activePage, users, currentUserId, setCurrentUser, setActivePage, addNotification } = useAppStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pageInfo = pageTitles[activePage] || pageTitles.dashboard

  // Get current user
  const currentUser = users.find((u) => u.id === currentUserId) || users[0]
  const otherUsers = users.filter((u) => u.id !== currentUser?.id)

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSwitchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setCurrentUser(userId)
      addNotification({
        type: 'info',
        title: 'Switched User',
        message: `Now logged in as ${user.name}`,
        duration: 3000,
      })
    }
    setUserMenuOpen(false)
  }

  const handleManageUsers = () => {
    setActivePage('settings')
    setUserMenuOpen(false)
  }

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="flex items-center gap-4 px-6 h-16 border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0 z-10">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h1 className="font-display font-bold text-lg leading-tight text-[var(--text-primary)] truncate">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-[var(--text-muted)] truncate">{pageInfo.subtitle}</p>
        </motion.div>
      </div>

      {/* Search bar */}
      <div className="hidden md:flex items-center gap-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl px-3 py-2 w-64 group focus-within:border-brand-500 transition-colors duration-200">
        <Search className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search documents, queries..."
          className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none min-w-0"
        />
        <kbd className="hidden lg:flex items-center gap-0.5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-overlay)] px-1.5 py-0.5 rounded border border-[var(--border)]">
          ⌘K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-[var(--surface)]" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200',
            'hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          )}
          aria-label="Toggle theme"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </motion.div>
        </button>

        {/* User avatar with dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-[var(--surface-elevated)] transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-glow-sm">
              <span className="text-white text-xs font-bold font-display">
                {currentUser ? getInitials(currentUser.name) : '?'}
              </span>
            </div>
            <div className="hidden lg:flex flex-col items-start">
              <span className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                {currentUser ? truncate(currentUser.name, 20) : 'Unknown'}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] leading-tight">
                {currentUser?.role || 'User'}
              </span>
            </div>
            <motion.div
              animate={{ rotate: userMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors" />
            </motion.div>
          </button>

          {/* User dropdown menu */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-64 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl shadow-lg z-50 py-2"
              >
                {/* Current user header */}
                <div className="px-3 py-2 border-b border-[var(--border)]">
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Current User
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {currentUser ? getInitials(currentUser.name) : '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {currentUser?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {currentUser?.email || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Other users */}
                {otherUsers.length > 0 && (
                  <div className="py-1">
                    <p className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Switch to
                    </p>
                    {otherUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSwitchUser(user.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--surface-overlay)] transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[var(--surface-overlay)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                          <span className="text-[var(--text-secondary)] text-[10px] font-bold">
                            {getInitials(user.name)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text-primary)] truncate">{user.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{user.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-[var(--border)] pt-1 mt-1">
                  <button
                    onClick={handleManageUsers}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--surface-overlay)] transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-sm text-[var(--text-primary)]">Manage Users</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
