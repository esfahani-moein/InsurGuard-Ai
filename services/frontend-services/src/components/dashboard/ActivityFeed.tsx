'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, Upload, Search, FileBarChart2, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'query' | 'upload' | 'analysis' | 'export'
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error'
}

const mockActivity: ActivityItem[] = [
  { id: '1', type: 'analysis', description: 'Coverage gap analysis completed for Policy #INS-2024-001', timestamp: '2 min ago', status: 'success' },
  { id: '2', type: 'upload', description: 'Policy document "HomeOwner_Policy_v3.pdf" uploaded', timestamp: '8 min ago', status: 'success' },
  { id: '3', type: 'query', description: 'Liability coverage query processed', timestamp: '15 min ago', status: 'success' },
  { id: '4', type: 'analysis', description: 'Risk assessment flagged for manual review', timestamp: '32 min ago', status: 'warning' },
  { id: '5', type: 'export', description: 'Monthly compliance report exported', timestamp: '1 hr ago', status: 'success' },
  { id: '6', type: 'query', description: 'Exclusion clause lookup - timeout error', timestamp: '2 hr ago', status: 'error' },
]

const typeIcon: Record<ActivityItem['type'], React.ElementType> = {
  query: Search,
  upload: Upload,
  analysis: FileBarChart2,
  export: Download,
}

const statusIcon: Record<ActivityItem['status'], React.ElementType> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
}

const statusColors: Record<ActivityItem['status'], string> = {
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
}

const typeBg: Record<ActivityItem['type'], string> = {
  query: 'bg-brand-600/15 text-brand-400',
  upload: 'bg-violet-500/15 text-violet-400',
  analysis: 'bg-cyan-500/15 text-cyan-400',
  export: 'bg-emerald-500/15 text-emerald-400',
}

interface ActivityFeedProps {
  items?: ActivityItem[]
}

export function ActivityFeed({ items = mockActivity }: ActivityFeedProps) {
  return (
    <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <h3 className="font-display font-semibold text-[var(--text-primary)]">Recent Activity</h3>
        <button className="text-xs text-brand-500 hover:text-brand-400 transition-colors">View all</button>
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">
        {items.map((item, i) => {
          const TypeIcon = typeIcon[item.type]
          const StatusIcon = statusIcon[item.status]
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-[var(--surface-overlay)] transition-colors duration-150"
            >
              <div className={cn('flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 mt-0.5', typeBg[item.type])}>
                <TypeIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] leading-snug">{item.description}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.timestamp}</p>
              </div>
              <StatusIcon className={cn('w-4 h-4 flex-shrink-0 mt-1', statusColors[item.status])} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
