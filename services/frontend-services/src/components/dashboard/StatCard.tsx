'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  iconColor?: string
  description?: string
  index?: number
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-brand-500',
  description,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-5 overflow-hidden group hover:border-brand-600/40 transition-all duration-300"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600/0 to-brand-600/0 group-hover:from-brand-600/5 group-hover:to-transparent transition-all duration-500 rounded-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold font-display text-[var(--text-primary)] leading-none mb-1.5">
            {value}
          </p>
          {(change || description) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {change && (
                <span
                  className={cn(
                    'text-xs font-medium px-1.5 py-0.5 rounded-md',
                    changeType === 'positive' &&
                      'text-emerald-400 bg-emerald-400/10',
                    changeType === 'negative' && 'text-red-400 bg-red-400/10',
                    changeType === 'neutral' &&
                      'text-[var(--text-muted)] bg-[var(--surface-overlay)]'
                  )}
                >
                  {change}
                </span>
              )}
              {description && (
                <span className="text-xs text-[var(--text-muted)]">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex items-center justify-center w-11 h-11 rounded-xl bg-[var(--surface-overlay)] flex-shrink-0',
            'group-hover:scale-110 transition-transform duration-300'
          )}
        >
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </motion.div>
  )
}
