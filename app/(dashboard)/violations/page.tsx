'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getThreatLevelColor, getThreatLevelBg, getThreatLevelLabel } from '@/lib/threat-score'
import { Play, Hash, MessageCircle, Camera, Search, ShieldAlert, ChevronDown, ChevronRight, Activity, Mail, CheckCircle2 } from 'lucide-react'

type Status = 'all' | 'new' | 'reviewed' | 'takedown_sent' | 'ignored'

interface Violation {
  id: string
  asset_id: string
  found_url: string
  platform: string
  status: 'new' | 'reviewed' | 'takedown_sent' | 'ignored'
  confidence: number
  og_title: string | null
  has_video: boolean
  detected_at: string
  assets: { title: string, url: string }
}

const PlatformIcon = ({ platform, className = "w-4 h-4" }: { platform: string, className?: string }) => {
  switch (platform.toLowerCase()) {
    case 'youtube': return <Play className={`${className} text-red-500`} fill="currentColor" />
    case 'twitter': return <Hash className={`${className} text-blue-400`} />
    case 'telegram': return <MessageCircle className={`${className} text-sky-400`} fill="currentColor" />
    case 'reddit': return <div className={`flex items-center justify-center rounded-full bg-orange-500 text-white ${className}`}><span className="text-[10px] font-bold">R</span></div>
    case 'instagram': return <Camera className={`${className} text-pink-500`} />
    default: return <Search className={`${className} text-slate-400`} />
  }
}

export default function ViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  
  // DMCA Composer State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [dmcaStep, setDmcaStep] = useState<1 | 2 | 3>(1)
  const [dmcaData, setDmcaData] = useState({ recipient: '', subject: '', body: '' })
  const [sendingDmca, setSendingDmca] = useState(false)
  
  // Toast
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/violations')
      .then(r => r.json())
      .then(data => { setViolations(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  async function updateStatus(id: string, status: 'reviewed' | 'ignored') {
    setUpdating(id)
    const res = await fetch('/api/violations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      setViolations(prev =>
        prev.map(v => v.id === id ? { ...v, status } : v)
      )
    }
    setUpdating(null)
  }

  // --- Selection & Row Expand Logic ---
  function toggleSelection(id: string) {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(v => v.id)))
    }
  }

  function toggleExpandRow(id: string) {
    const newSet = new Set(expandedRows)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setExpandedRows(newSet)
  }

  function handleOpenComposer() {
    if (selectedIds.size === 0) return
    const selected = violations.filter(v => selectedIds.has(v.id))
    const platform = selected[0].platform
    
    let recipient = ''
    if (platform === 'YouTube') recipient = 'copyright@youtube.com'
    else if (platform === 'Twitter') recipient = 'copyright@twitter.com'
    else if (platform === 'Reddit') recipient = 'legal@reddit.com'
    else if (platform === 'Telegram') recipient = 'dmca@telegram.org'
    else if (platform === 'Facebook') recipient = 'ip@fb.com'
    else if (platform === 'TikTok') recipient = 'copyright@tiktok.com'
    else recipient = 'abuse@domain.com'

    const subject = `Notice of Copyright Infringement - ${selected[0].assets.title}`
    const urlsText = selected.map(v => `- ${v.found_url}`).join('\n')

    const body = `To whom it may concern,\n\nThis is a Notice of Copyright Infringement pursuant to the Digital Millennium Copyright Act (DMCA).\n\nI am the copyright owner of the following original content:\nTitle: ${selected[0].assets.title}\nOriginal Source: ${selected[0].assets.url}\n\nI have a good faith belief that the following URLs contain unauthorized reproductions of the copyrighted work:\n${urlsText}\n\nThese reproductions are not authorized by the copyright owner, its agent, or the law.\n\nI request that you immediately disable access to or remove the infringing material from your platform.\n\nUnder penalty of perjury, I state that the information in this notification is accurate and that I am the copyright owner.\n\nSincerely,\n\n[Your Name]`

    setDmcaData({ recipient, subject, body })
    setDmcaStep(1)
    setShowModal(true)
  }

  async function handleSendDMCA() {
    setSendingDmca(true)
    try {
      const res = await fetch('/api/violations/send-takedown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          violation_ids: Array.from(selectedIds),
          recipient_email: dmcaData.recipient,
          subject: dmcaData.subject,
          email_body: dmcaData.body
        })
      })

      if (res.ok) {
        setDmcaStep(3)
        setTimeout(() => {
          setShowModal(false)
          setSelectedIds(new Set())
          setViolations(prev => prev.map(v => selectedIds.has(v.id) ? { ...v, status: 'takedown_sent' } : v))
        }, 2500)
      } else {
        const err = await res.json()
        showToast(`Error: ${err.error}`)
        setDmcaStep(2)
      }
    } catch (err) {
      showToast('Failed to send DMCA notice.')
      setDmcaStep(2)
    } finally {
      setSendingDmca(false)
    }
  }

  const filtered = filter === 'all' ? violations : violations.filter(v => v.status === filter)
  const filterBtns: Status[] = ['all', 'new', 'reviewed', 'takedown_sent', 'ignored']

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Violations Inbox</h1>
          <p className="text-slate-400 text-sm mt-1">Review AI-detected threats and send DMCA notices</p>
        </div>
      </div>

      {toast && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {toast}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {filterBtns.map(f => {
          const count = f === 'all' ? violations.length : violations.filter(v => v.status === f).length
          const isActive = filter === f
          return (
            <button
              key={f}
              id={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-500 text-white shadow-md border-indigo-500'
                  : 'bg-slate-900/50 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="capitalize">{f.replace('_', ' ')}</span>
              <span className={`px-2 py-0.5 rounded-md text-xs ${isActive ? 'bg-indigo-600/50' : 'bg-slate-800'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Activity className="animate-spin h-8 w-8 text-indigo-400" />
          </div>
        ) : filtered.length === 0 ? (
           <div className="text-center py-20 bg-slate-900/20 rounded-xl border border-dashed border-slate-700/50 m-2">
            <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No violations found</h3>
            <p className="text-slate-500 mt-1">You're all clear in this view.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="border-b border-slate-700/60 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-4 px-3 w-10 border-b border-slate-700">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-800 w-4 h-4"
                    />
                  </th>
                  <th className="py-4 px-3 w-10 border-b border-slate-700"></th>
                  <th className="py-4 px-3 border-b border-slate-700">Confidence</th>
                  <th className="py-4 px-3 border-b border-slate-700">Platform</th>
                  <th className="py-4 px-3 border-b border-slate-700">Asset & URL</th>
                  <th className="py-4 px-3 border-b border-slate-700">Status</th>
                  <th className="py-4 px-3 text-right border-b border-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => {
                  const isSelected = selectedIds.has(v.id)
                  const isExpanded = expandedRows.has(v.id)
                  // Confidence Gradient background
                  const rowBg = v.confidence >= 90 ? 'bg-red-500/5 hover:bg-red-500/10' 
                              : v.confidence >= 60 ? 'bg-yellow-500/5 hover:bg-yellow-500/10' 
                              : 'bg-slate-800/20 hover:bg-slate-800/40'
                  
                  return (
                    <React.Fragment key={v.id}>
                      <tr className={`transition-colors cursor-pointer ${isSelected ? 'bg-indigo-500/10 hover:bg-indigo-500/15' : rowBg}`} onClick={(e) => {
                        // Prevent expanding row if clicking checkbox or buttons
                        if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'BUTTON') {
                          toggleExpandRow(v.id)
                        }
                      }}>
                        <td className={`py-4 px-3 border-b border-slate-800 ${isSelected ? 'border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent'}`}>
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleSelection(v.id)}
                            className="rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-800 w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-3 border-b border-slate-800">
                          <button onClick={() => toggleExpandRow(v.id)} className="text-slate-500 hover:text-slate-300">
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </button>
                        </td>
                        <td className="py-4 px-3 border-b border-slate-800">
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm ${getThreatLevelBg(v.confidence)} ${getThreatLevelColor(v.confidence)}`}>
                            {v.confidence}% {getThreatLevelLabel(v.confidence)}
                          </div>
                        </td>
                        <td className="py-4 px-3 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <PlatformIcon platform={v.platform} className="w-5 h-5" />
                            <span className="font-medium text-slate-300">{v.platform}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 border-b border-slate-800">
                          <div className="text-slate-200 font-semibold truncate max-w-[250px]">{v.assets?.title}</div>
                          <div className="text-slate-500 text-xs truncate max-w-[250px] mt-0.5">{v.found_url}</div>
                        </td>
                        <td className="py-4 px-3 border-b border-slate-800">
                          <Badge color={v.status === 'takedown_sent' ? 'blue' : v.status}>
                            {v.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-4 px-3 border-b border-slate-800 text-right">
                          <div className="flex gap-2 justify-end">
                            {v.status === 'new' && (
                              <Button variant="secondary" size="sm" loading={updating === v.id} onClick={(e) => { e.stopPropagation(); updateStatus(v.id, 'reviewed') }}>
                                Mark Reviewed
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-900 border-b border-slate-800">
                          <td colSpan={7} className="p-0 border-b border-slate-800">
                            <div className="px-12 py-6 animate-in slide-in-from-top-2 fade-in duration-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Violation Details</h4>
                                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
                                    <div>
                                      <span className="block text-xs text-slate-500 mb-1">Found URL</span>
                                      <a href={v.found_url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline break-all text-sm font-mono">
                                        {v.found_url}
                                      </a>
                                    </div>
                                    {v.og_title && (
                                      <div>
                                        <span className="block text-xs text-slate-500 mb-1">OpenGraph Title</span>
                                        <p className="text-sm text-slate-300">"{v.og_title}"</p>
                                      </div>
                                    )}
                                    <div className="flex gap-4">
                                      <div>
                                        <span className="block text-xs text-slate-500 mb-1">Detected</span>
                                        <p className="text-sm text-slate-300">{new Date(v.detected_at).toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <span className="block text-xs text-slate-500 mb-1">Video Found</span>
                                        <p className="text-sm text-slate-300">{v.has_video ? 'Yes' : 'No'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Audit Trail</h4>
                                  <div className="relative border-l border-slate-700 ml-2 space-y-4 pb-2">
                                    <div className="relative pl-5">
                                      <div className="absolute w-2 h-2 bg-slate-500 rounded-full -left-[5px] top-1.5 ring-4 ring-slate-900"></div>
                                      <p className="text-sm font-medium text-slate-300">AI Detection Logged</p>
                                      <p className="text-xs text-slate-500">{new Date(v.detected_at).toLocaleString()}</p>
                                    </div>
                                    {v.status === 'reviewed' && (
                                      <div className="relative pl-5">
                                        <div className="absolute w-2 h-2 bg-emerald-500 rounded-full -left-[5px] top-1.5 ring-4 ring-slate-900"></div>
                                        <p className="text-sm font-medium text-emerald-400">Marked as Reviewed</p>
                                      </div>
                                    )}
                                    {v.status === 'takedown_sent' && (
                                      <div className="relative pl-5">
                                        <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5 ring-4 ring-slate-900"></div>
                                        <p className="text-sm font-medium text-blue-400">DMCA Notice Sent</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-800/95 backdrop-blur-xl border border-slate-700 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <span className="text-indigo-400 font-bold text-sm">{selectedIds.size}</span>
            </div>
            <span className="text-sm font-medium text-slate-200">violations selected</span>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="flex items-center gap-3">
            <Button variant="danger" size="sm" onClick={handleOpenComposer} className="shadow-lg shadow-red-500/20 font-semibold px-4">
              <Mail className="w-4 h-4 mr-2" />
              Compose DMCA
            </Button>
            <Button variant="secondary" size="sm" onClick={() => {
              Array.from(selectedIds).forEach(id => updateStatus(id, 'ignored'))
              setSelectedIds(new Set())
            }} className="bg-slate-900 border-slate-700">
              Ignore Selected
            </Button>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-slate-400 hover:text-slate-200 ml-2 font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modern DMCA Wizard Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  DMCA Takedown Request
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {dmcaStep === 1 && "Step 1: Review target violations"}
                  {dmcaStep === 2 && "Step 2: Preview & edit email content"}
                  {dmcaStep === 3 && "Complete!"}
                </p>
              </div>
              {dmcaStep !== 3 && (
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">✕</button>
              )}
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {dmcaStep === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 fade-in">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                    <p className="text-red-400 text-sm font-medium">You are about to issue a formal legal request.</p>
                    <p className="text-slate-400 text-xs mt-1">Under penalty of perjury, you must be the copyright owner to send this notice.</p>
                  </div>
                  
                  <h3 className="text-sm font-semibold text-slate-300">Selected Targets ({selectedIds.size})</h3>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-60 overflow-y-auto space-y-3">
                    {violations.filter(v => selectedIds.has(v.id)).map(v => (
                      <div key={v.id} className="flex items-center gap-3 text-sm">
                        <PlatformIcon platform={v.platform} />
                        <span className="text-slate-300 font-medium truncate w-1/3">{v.assets.title}</span>
                        <span className="text-slate-500 text-xs truncate w-2/3 font-mono">{v.found_url}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dmcaStep === 2 && (
                <div className="space-y-5 animate-in slide-in-from-right-4 fade-in h-full flex flex-col">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recipient Email</label>
                    <input 
                      type="email" 
                      value={dmcaData.recipient} 
                      onChange={e => setDmcaData({...dmcaData, recipient: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                    <input 
                      type="text" 
                      value={dmcaData.subject} 
                      onChange={e => setDmcaData({...dmcaData, subject: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="flex-1 flex flex-col min-h-[250px]">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Body</label>
                    <textarea 
                      value={dmcaData.body} 
                      onChange={e => setDmcaData({...dmcaData, body: e.target.value})}
                      className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono leading-relaxed resize-none"
                    />
                  </div>
                </div>
              )}

              {dmcaStep === 3 && (
                <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in fade-in duration-300">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">DMCA Notice Sent!</h3>
                  <p className="text-slate-400 text-center max-w-sm">
                    The takedown request has been dispatched to {dmcaData.recipient}. We'll monitor the status and notify you upon removal.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {dmcaStep !== 3 && (
              <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl flex justify-between items-center">
                <Button variant="ghost" onClick={() => dmcaStep === 2 ? setDmcaStep(1) : setShowModal(false)}>
                  {dmcaStep === 2 ? '← Back' : 'Cancel'}
                </Button>
                
                {dmcaStep === 1 ? (
                  <Button variant="primary" onClick={() => setDmcaStep(2)}>
                    Continue to Email Preview →
                  </Button>
                ) : (
                  <Button variant="danger" loading={sendingDmca} onClick={handleSendDMCA} className="shadow-lg shadow-red-500/20">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Official Notice
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
