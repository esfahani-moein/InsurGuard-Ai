'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

const weeklyData = [
  { day: 'Mon', queries: 142, documents: 18, accuracy: 98.1 },
  { day: 'Tue', queries: 198, documents: 24, accuracy: 98.4 },
  { day: 'Wed', queries: 167, documents: 21, accuracy: 97.9 },
  { day: 'Thu', queries: 234, documents: 31, accuracy: 98.7 },
  { day: 'Fri', queries: 189, documents: 26, accuracy: 98.2 },
  { day: 'Sat', queries: 87, documents: 9, accuracy: 99.1 },
  { day: 'Sun', queries: 62, documents: 6, accuracy: 99.3 },
]

const maxQueries = Math.max(...weeklyData.map((d) => d.queries))

const topQueryTypes = [
  { type: 'Coverage Gap Analysis', count: 2341, pct: 74 },
  { type: 'Exclusion Lookup', count: 1823, pct: 57 },
  { type: 'Policy Comparison', count: 1204, pct: 38 },
  { type: 'Risk Assessment', count: 876, pct: 28 },
  { type: 'Compliance Check', count: 654, pct: 21 },
]

export function AnalyticsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Queries (30d)', value: '24,832', trend: '+18%', up: true, icon: BarChart3, color: 'text-brand-400' },
            { label: 'Avg Accuracy', value: '98.4%', trend: '+0.6%', up: true, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Avg Response Time', value: '1.24s', trend: '-0.3s', up: true, icon: Activity, color: 'text-cyan-400' },
            { label: 'Error Rate', value: '0.03%', trend: '-0.01%', up: true, icon: TrendingDown, color: 'text-amber-400' },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{kpi.label}</p>
                <kpi.icon className={cn('w-4 h-4 flex-shrink-0', kpi.color)} />
              </div>
              <p className="text-2xl font-bold font-display text-[var(--text-primary)]">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-md">
                  {kpi.trend}
                </span>
                <span className="text-xs text-[var(--text-muted)]">vs last period</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bar chart: Weekly queries */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-[var(--text-primary)]">Weekly Query Volume</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">AI queries processed per day</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-brand-500 inline-block" />
                Queries
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-violet-400 inline-block" />
                Documents
              </span>
            </div>
          </div>

          <div className="flex items-end gap-3 h-48">
            {weeklyData.map((d, i) => (
              <motion.div
                key={d.day}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'bottom' }}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                {/* Document bar */}
                <div className="flex items-end gap-0.5 w-full h-40">
                  <div
                    className="flex-1 rounded-t-md bg-brand-500/80 hover:bg-brand-500 transition-colors cursor-default group relative"
                    style={{ height: `${(d.queries / maxQueries) * 100}%` }}
                    title={`${d.queries} queries`}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      {d.queries} queries
                    </div>
                  </div>
                  <div
                    className="flex-1 rounded-t-md bg-violet-400/60 hover:bg-violet-400/80 transition-colors cursor-default"
                    style={{ height: `${(d.documents / maxQueries) * 100 * 5}%` }}
                    title={`${d.documents} docs`}
                  />
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-medium">{d.day}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top query types */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-6"
          >
            <h3 className="font-display font-semibold text-[var(--text-primary)] mb-4">Top Query Types</h3>
            <div className="space-y-3">
              {topQueryTypes.map((item, i) => (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-[var(--text-secondary)]">{item.type}</span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--surface-overlay)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ delay: 0.6 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Accuracy over time — simple sparkline */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-6"
          >
            <h3 className="font-display font-semibold text-[var(--text-primary)] mb-1">Accuracy Trend</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">AI response accuracy this week</p>

            <div className="relative h-36">
              <svg className="w-full h-full" viewBox="0 0 420 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#338dff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#338dff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Area fill */}
                <path
                  d={`M 0 ${120 - ((weeklyData[0].accuracy - 97) / 2.5) * 100} ${weeklyData.map((d, i) => `L ${(i / (weeklyData.length - 1)) * 420} ${120 - ((d.accuracy - 97) / 2.5) * 100}`).join(' ')} L 420 120 L 0 120 Z`}
                  fill="url(#accGrad)"
                />
                {/* Line */}
                <polyline
                  points={weeklyData.map((d, i) => `${(i / (weeklyData.length - 1)) * 420},${120 - ((d.accuracy - 97) / 2.5) * 100}`).join(' ')}
                  fill="none"
                  stroke="#338dff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Points */}
                {weeklyData.map((d, i) => (
                  <circle
                    key={i}
                    cx={(i / (weeklyData.length - 1)) * 420}
                    cy={120 - ((d.accuracy - 97) / 2.5) * 100}
                    r="4"
                    fill="#338dff"
                    stroke="var(--surface-elevated)"
                    strokeWidth="2"
                  />
                ))}
              </svg>
            </div>

            <div className="flex items-center justify-between mt-2">
              {weeklyData.map((d) => (
                <span key={d.day} className="text-[10px] text-[var(--text-muted)]">{d.day}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
