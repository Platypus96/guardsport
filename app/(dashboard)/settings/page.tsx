'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { User, Bell, AlertTriangle, UploadCloud, Save, CheckCircle2 } from 'lucide-react'

type Tab = 'account' | 'notifications' | 'danger'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('account')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [templateSaveStatus, setTemplateSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [userEmail, setUserEmail] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [dmcaTemplate, setDmcaTemplate] = useState(
    `To whom it may concern,\n\nThis is a Notice of Copyright Infringement pursuant to the Digital Millennium Copyright Act (DMCA).\n\nI have a good faith belief that the following URLs contain unauthorized reproductions of the copyrighted work.\n\nThese reproductions are not authorized by the copyright owner, its agent, or the law.\n\nSincerely,\n\nGuardSport User`
  )

  useEffect(() => {
    // Fetch the current user's email from the API
    fetch('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.email) setUserEmail(data.email)
      })
      .catch(() => {})
  }, [])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    // Simulate save — real implementation would PATCH /api/me
    await new Promise(r => setTimeout(r, 800))
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const handleTemplateSave = async () => {
    setTemplateSaveStatus('saving')
    // Simulate save — real implementation would PATCH /api/settings/dmca-template
    await new Promise(r => setTimeout(r, 800))
    setTemplateSaveStatus('saved')
    setTimeout(() => setTemplateSaveStatus('idle'), 3000)
  }

  const navItems: { id: Tab, label: string, icon: any, danger?: boolean }[] = [
    { id: 'account', label: 'Account Profile', icon: User },
    { id: 'notifications', label: 'Notifications & DMCA', icon: Bell },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
  ]

  return (
    <div className="pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account preferences and notifications.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? item.danger
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 w-full max-w-3xl">

          {/* Account Profile Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card title="Public Profile">
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="relative w-24 h-24 rounded-full bg-slate-800 border border-slate-700 overflow-hidden group cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-10 h-10 text-slate-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <UploadCloud className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                    <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Change Avatar
                    </Button>
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={userEmail || '—'}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/30 border border-slate-800 text-slate-400 cursor-not-allowed text-sm truncate"
                      />
                      <p className="text-xs text-slate-500 mt-1.5">Email is managed by your authentication provider and cannot be changed here.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Display Name <span className="text-slate-600">(optional)</span></label>
                      <input
                        type="text"
                        placeholder="How should we address you?"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end items-center gap-3">
                  {saveStatus === 'saved' && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-400 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" /> Saved successfully
                    </span>
                  )}
                  <Button
                    variant="primary"
                    className="shadow-lg shadow-indigo-500/20"
                    loading={saveStatus === 'saving'}
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Notifications & DMCA Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card title="DMCA Notice Template">
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  Customize the default email body used when sending DMCA takedown notices.
                  When composing a notice, this template will be pre-filled — you can still edit it before sending.
                </p>

                <textarea
                  value={dmcaTemplate}
                  onChange={(e) => setDmcaTemplate(e.target.value)}
                  className="w-full h-64 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm leading-relaxed resize-none"
                />

                <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end items-center gap-3">
                  {templateSaveStatus === 'saved' && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-400 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" /> Template saved
                    </span>
                  )}
                  <Button
                    variant="primary"
                    className="shadow-lg shadow-indigo-500/20"
                    loading={templateSaveStatus === 'saving'}
                    onClick={handleTemplateSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Template
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <h3 className="text-lg font-bold text-white">Danger Zone</h3>
                </div>

                <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-6">
                  <h4 className="text-base font-semibold text-red-400 mb-2">Delete Account</h4>
                  <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                    Once you delete your account, there is no going back. All of your assets, violations,
                    cryptographic proofs, and DMCA history will be permanently erased. Please be certain.
                  </p>

                  <div className="bg-slate-900 border border-red-500/20 rounded-lg p-4 mb-6">
                    <p className="text-xs font-medium text-slate-300 mb-2">
                      To confirm, type <span className="font-mono text-red-400 bg-red-500/10 px-1 rounded">delete my account</span> below:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={e => setDeleteConfirm(e.target.value)}
                      placeholder="delete my account"
                      className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                    />
                  </div>

                  <Button
                    variant="danger"
                    disabled={deleteConfirm !== 'delete my account'}
                    className="w-full sm:w-auto shadow-lg shadow-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Permanently Delete Account
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
