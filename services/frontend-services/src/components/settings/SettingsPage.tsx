'use client'

import { useState, useEffect, type ElementType } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Bell, Shield, Database, Key, User, Save, Cpu } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { modelsApi, type GeminiModel } from '@/lib/api'
import { cn } from '@/lib/utils'

type Section = 'appearance' | 'account' | 'notifications' | 'api' | 'privacy'

const sections: { id: Section; label: string; icon: ElementType }[] = [
  { id: 'appearance', label: 'Appearance', icon: Sun },
  { id: 'account', label: 'Account', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'privacy', label: 'Privacy & Data', icon: Shield },
]

export function SettingsPage() {
  const { theme, setTheme, selectedModel, setSelectedModel } = useAppStore()
  const [activeSection, setActiveSection] = useState<Section>('appearance')
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [geminiModels, setGeminiModels] = useState<GeminiModel[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)

  useEffect(() => {
    if (activeSection === 'api') {
      setModelsLoading(true)
      modelsApi.getModels()
        .then((res) => {
          setGeminiModels(res.models)
          if (!res.models.some((m) => m.id === selectedModel)) {
            setSelectedModel(res.default || res.models[0]?.id || 'gemini-2.5-flash')
          }
        })
        .catch(() => setGeminiModels([]))
        .finally(() => setModelsLoading(false))
    }
  }, [activeSection, selectedModel, setSelectedModel])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Section nav */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-1">
              {sections.map((s) => {
                const Icon = s.icon
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-150',
                      activeSection === s.id
                        ? 'bg-brand-600 text-white shadow-glow-sm'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {s.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-6 space-y-6"
            >
              {activeSection === 'appearance' && (
                <>
                  <div>
                    <h2 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-1">Appearance</h2>
                    <p className="text-sm text-[var(--text-muted)]">Customize the look and feel of the application.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[var(--text-secondary)] block mb-3">Theme</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['light', 'dark'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={cn(
                              'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200',
                              theme === t
                                ? 'border-brand-500 bg-brand-600/10 text-brand-400'
                                : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                            )}
                          >
                            {t === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            {t.charAt(0).toUpperCase() + t.slice(1)} Mode
                            {theme === t && (
                              <span className="ml-auto w-2 h-2 rounded-full bg-brand-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[var(--text-secondary)] block mb-3">Font Size</label>
                      <div className="flex items-center gap-3">
                        {['Small', 'Medium', 'Large'].map((size) => (
                          <button
                            key={size}
                            className={cn(
                              'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                              size === 'Medium'
                                ? 'border-brand-500 text-brand-400 bg-brand-600/10'
                                : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                            )}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'account' && (
                <>
                  <div>
                    <h2 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-1">Account Settings</h2>
                    <p className="text-sm text-[var(--text-muted)]">Manage your account details and preferences.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-sm">
                        <span className="text-white text-xl font-bold font-display">JD</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">John Doe</p>
                        <p className="text-sm text-[var(--text-muted)]">Administrator</p>
                        <button className="text-xs text-brand-500 hover:text-brand-400 mt-1 transition-colors">Change avatar</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Full Name', value: 'John Doe' },
                        { label: 'Email', value: 'john.doe@company.com' },
                        { label: 'Organization', value: 'InsureCo Inc.' },
                        { label: 'Role', value: 'Administrator' },
                      ].map((field) => (
                        <div key={field.label}>
                          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                            {field.label}
                          </label>
                          <input
                            defaultValue={field.value}
                            className="w-full bg-[var(--surface-overlay)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-brand-500 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'notifications' && (
                <>
                  <div>
                    <h2 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-1">Notifications</h2>
                    <p className="text-sm text-[var(--text-muted)]">Control how you receive alerts and updates.</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Coverage gap alerts', description: 'Notify when gaps are detected in policy analysis', enabled: true },
                      { label: 'Analysis complete', description: 'When a document analysis finishes', enabled: true },
                      { label: 'Risk flag alerts', description: 'Immediate alerts for high-risk findings', enabled: true },
                      { label: 'Weekly reports', description: 'Summary email every Monday morning', enabled: false },
                      { label: 'API usage warnings', description: 'When approaching API rate limits', enabled: false },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start justify-between gap-4 py-3 border-b border-[var(--border-subtle)] last:border-0">
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.description}</p>
                        </div>
                        <button
                          className={cn(
                            'relative flex-shrink-0 w-10 h-5.5 rounded-full transition-all duration-200',
                            item.enabled ? 'bg-brand-600' : 'bg-[var(--surface-overlay)]'
                          )}
                          style={{ height: '22px' }}
                        >
                          <span
                            className={cn(
                              'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
                              item.enabled ? 'left-[calc(100%-18px)]' : 'left-0.5'
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeSection === 'api' && (
                <>
                  <div>
                    <h2 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-1">API Configuration</h2>
                    <p className="text-sm text-[var(--text-muted)]">Configure API endpoints and authentication.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Backend API URL</label>
                      <input
                        defaultValue="http://localhost:8000"
                        className="w-full bg-[var(--surface-overlay)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] font-mono outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">API Key</label>
                      <div className="relative">
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="sk-..."
                          className="w-full bg-[var(--surface-overlay)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] font-mono outline-none focus:border-brand-500 transition-colors pr-24"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-brand-500 hover:text-brand-400 transition-colors px-2 py-1">
                          Generate
                        </button>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1.5">Store your API key securely. Never share it publicly.</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                        AI Model
                      </label>
                      <p className="text-xs text-[var(--text-muted)] mb-3">
                        Select the Gemini model used for all chat and analysis tasks. Changes apply immediately.
                      </p>
                      {modelsLoading ? (
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] py-2">
                          <div className="w-4 h-4 border-2 border-brand-500/40 border-t-brand-500 rounded-full animate-spin" />
                          Loading models…
                        </div>
                      ) : geminiModels.length > 0 ? (
                        <div className="space-y-2">
                          {geminiModels.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setSelectedModel(m.id)}
                              className={cn(
                                'flex items-start gap-3 w-full px-4 py-3 rounded-xl border text-left transition-all duration-200',
                                selectedModel === m.id
                                  ? 'border-brand-500 bg-brand-600/10'
                                  : 'border-[var(--border)] hover:border-[var(--text-muted)] bg-[var(--surface-overlay)]'
                              )}
                            >
                              <div className={cn(
                                'mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center',
                                selectedModel === m.id ? 'border-brand-500' : 'border-[var(--border)]'
                              )}>
                                {selectedModel === m.id && (
                                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Cpu className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                  <span className={cn(
                                    'text-sm font-medium',
                                    selectedModel === m.id ? 'text-brand-400' : 'text-[var(--text-primary)]'
                                  )}>
                                    {m.name}
                                  </span>
                                  {m.is_default && (
                                    <span className="text-[10px] font-medium bg-brand-600/20 text-brand-400 px-1.5 py-0.5 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5">{m.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <p className="text-xs text-amber-400">
                            Could not load models — backend may be offline. Default: <span className="font-mono font-medium">gemini-2.5-flash</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'privacy' && (
                <>
                  <div>
                    <h2 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-1">Privacy & Data</h2>
                    <p className="text-sm text-[var(--text-muted)]">Control your data and privacy settings.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <Shield className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-400">Data Retention Policy</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Documents and conversations are stored for 90 days by default.</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Encrypt conversation history', description: 'Use end-to-end encryption for chat data', enabled: true },
                        { label: 'Share usage analytics', description: 'Help improve the product with anonymized data', enabled: false },
                        { label: 'Auto-delete conversations', description: 'Remove conversations after 30 days', enabled: false },
                      ].map((item) => (
                        <div key={item.label} className="flex items-start justify-between gap-4 py-3 border-b border-[var(--border-subtle)] last:border-0">
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.description}</p>
                          </div>
                          <button
                            className={cn(
                              'relative flex-shrink-0 w-10 rounded-full transition-all duration-200',
                              item.enabled ? 'bg-brand-600' : 'bg-[var(--surface-overlay)]'
                            )}
                            style={{ height: '22px' }}
                          >
                            <span
                              className={cn(
                                'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
                                item.enabled ? 'left-[calc(100%-18px)]' : 'left-0.5'
                              )}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-red-400 transition-colors">
                        <Database className="w-4 h-4" />
                        Delete all conversation data
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Save button */}
              <div className="flex justify-end pt-4 border-t border-[var(--border)]">
                <button
                  onClick={handleSave}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    saved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-brand-600 text-white hover:bg-brand-700 shadow-glow-sm'
                  )}
                >
                  <Save className="w-4 h-4" />
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
