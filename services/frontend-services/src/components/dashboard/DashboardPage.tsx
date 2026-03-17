'use client'

import { motion } from 'framer-motion'
import {
  FileText,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  Users,
} from 'lucide-react'
import { StatCard } from './StatCard'
import { ActivityFeed } from './ActivityFeed'
import { useAppStore } from '@/lib/store'

const stats = [
  {
    title: 'Documents Analyzed',
    value: '1,284',
    change: '+12% this week',
    changeType: 'positive' as const,
    icon: FileText,
    iconColor: 'text-brand-400',
    description: 'policy documents',
  },
  {
    title: 'AI Queries',
    value: '8,432',
    change: '+24% this week',
    changeType: 'positive' as const,
    icon: MessageSquare,
    iconColor: 'text-violet-400',
    description: 'processed',
  },
  {
    title: 'Coverage Checks',
    value: '3,912',
    change: '+8% this week',
    changeType: 'positive' as const,
    icon: ShieldCheck,
    iconColor: 'text-emerald-400',
    description: 'completed',
  },
  {
    title: 'Risk Flags',
    value: '47',
    change: '-3 from last week',
    changeType: 'positive' as const,
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    description: 'pending review',
  },
  {
    title: 'Accuracy Rate',
    value: '98.4%',
    change: '+0.6%',
    changeType: 'positive' as const,
    icon: TrendingUp,
    iconColor: 'text-cyan-400',
    description: 'AI accuracy',
  },
  {
    title: 'Avg Response',
    value: '1.2s',
    change: '-0.3s improved',
    changeType: 'positive' as const,
    icon: Clock,
    iconColor: 'text-pink-400',
    description: 'response time',
  },
  {
    title: 'Active Users',
    value: '124',
    change: '+18 today',
    changeType: 'positive' as const,
    icon: Users,
    iconColor: 'text-indigo-400',
    description: 'team members',
  },
  {
    title: 'API Uptime',
    value: '99.97%',
    change: 'SLA compliant',
    changeType: 'neutral' as const,
    icon: Zap,
    iconColor: 'text-yellow-400',
    description: 'last 30 days',
  },
]

export function DashboardPage() {
  const { setActivePage, createConversation, setActiveConversation } = useAppStore()

  const handleStartChat = () => {
    const id = createConversation()
    setActiveConversation(id)
    setActivePage('chat')
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-6 text-white"
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/20 translate-y-1/3 -translate-x-1/3" />
          </div>

          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-brand-200 text-sm font-medium mb-1">Welcome back, John</p>
              <h2 className="font-display font-bold text-2xl mb-2">
                InsurGuard AI Platform
              </h2>
              <p className="text-brand-100/80 text-sm max-w-lg">
                Your AI-powered insurance coverage analysis suite. Analyze policies, detect coverage gaps, and ensure legal compliance — all in one place.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleStartChat}
                className="flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                Start Analysis
              </button>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all duration-200">
                <FileText className="w-4 h-4" />
                Upload Policy
              </button>
            </div>
          </div>

          {/* Status indicators */}
          <div className="relative flex items-center gap-4 mt-5 pt-5 border-t border-white/20 flex-wrap">
            {[
              { label: 'System Status', value: 'Operational', color: 'bg-emerald-400' },
              { label: 'AI Model', value: 'GPT-4 Turbo', color: 'bg-brand-300' },
              { label: 'Last Updated', value: '2 min ago', color: 'bg-amber-300' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-xs text-white/70">{item.label}:</span>
                <span className="text-xs text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats grid */}
        <div>
          <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4">Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <StatCard key={stat.title} {...stat} index={i} />
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity feed */}
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-5">
              <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { icon: MessageSquare, label: 'Ask AI Assistant', color: 'text-brand-400 bg-brand-600/10', action: handleStartChat },
                  { icon: FileText, label: 'Upload Document', color: 'text-violet-400 bg-violet-500/10', action: () => {} },
                  { icon: ShieldCheck, label: 'Coverage Check', color: 'text-emerald-400 bg-emerald-500/10', action: () => {} },
                  { icon: AlertTriangle, label: 'Risk Assessment', color: 'text-amber-400 bg-amber-500/10', action: () => {} },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-[var(--surface-overlay)] transition-colors duration-150 text-left group"
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${item.color}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors font-medium">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Coverage score widget */}
            <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-5">
              <h3 className="font-display font-semibold text-[var(--text-primary)] mb-3">Coverage Score</h3>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--surface-overlay)" strokeWidth="6" />
                    <circle
                      cx="32" cy="32" r="28"
                      fill="none"
                      stroke="#338dff"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 28 * 0.87} ${2 * Math.PI * 28}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold font-display text-[var(--text-primary)]">87</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Good Coverage</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">3 gaps detected</p>
                  <button className="text-xs text-brand-500 hover:text-brand-400 mt-1.5 transition-colors">
                    View details →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
