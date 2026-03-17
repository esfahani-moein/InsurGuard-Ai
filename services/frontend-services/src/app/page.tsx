'use client'

import { useAppStore } from '@/lib/store'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { ChatHistorySidebar } from '@/components/layout/ChatHistorySidebar'
import { DashboardPage } from '@/components/dashboard/DashboardPage'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { SettingsPage } from '@/components/settings/SettingsPage'
import { AnalyticsPage } from '@/components/analytics/AnalyticsPage'
import { AnimatePresence, motion } from 'framer-motion'

export default function Home() {
  const { activePage } = useAppStore()
  const showChatSidebar = activePage === 'chat'

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface)]">
      {/* Left nav sidebar */}
      <Sidebar />

      {/* Chat history sidebar (only on chat page) */}
      <AnimatePresence>
        {showChatSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden flex-shrink-0"
          >
            <ChatHistorySidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              {activePage === 'dashboard' && <DashboardPage />}
              {activePage === 'chat' && <ChatInterface />}
              {activePage === 'analytics' && <AnalyticsPage />}
              {activePage === 'settings' && <SettingsPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
