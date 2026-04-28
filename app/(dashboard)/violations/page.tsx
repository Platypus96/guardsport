'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getThreatLevelColor, getThreatLevelBg, getThreatLevelLabel } from '@/lib/threat-score'

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

export default function ViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  
  // DMCA Composer State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
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

  // --- Selection Logic ---
  function toggleSelection(id: string) {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  function handleOpenComposer() {
    if (selectedIds.size === 0) return
    const selected = violations.filter(v => selectedIds.has(v.id))
    // Group by platform for recipient suggestion (just use first platform as default)
    const platform = selected[0].platform
    
    let recipient = ''
    if (platform === 'YouTube') recipient = 'copyright@youtube.com'
    else if (platform === 'Twitter') recipient = 'copyright@twitter.com'
    else if (platform === 'Reddit') recipient = 'legal@reddit.com'
    else if (platform === 'Telegram') recipient = 'dmca@telegram.org'
    else if (platform === 'Facebook') recipient = 'ip@fb.com'
    else if (platform === 'TikTok') recipient = 'copyright@tiktok.com'

    const subject = `Notice of Copyright Infringement - ${selected[0].assets.title}`
    const urlsText = selected.map(v => `- ${v.found_url}`).join('\n')

    const body = `To whom it may concern,\n\nThis is a Notice of Copyright Infringement pursuant to the Digital Millennium Copyright Act (DMCA).\n\nI am the copyright owner of the following original content:\nTitle: ${selected[0].assets.title}\nOriginal Source: ${selected[0].assets.url}\n\nI have a good faith belief that the following URLs contain unauthorized reproductions of the copyrighted work:\n${urlsText}\n\nThese reproductions are not authorized by the copyright owner, its agent, or the law.\n\nI request that you immediately disable access to or remove the infringing material from your platform.\n\nUnder penalty of perjury, I state that the information in this notification is accurate and that I am the copyright owner.\n\nSincerely,\n\n[Your Name]`

    setDmcaData({ recipient, subject, body })
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
        showToast('Takedown notice sent successfully!')
        setShowModal(false)
        setSelectedIds(new Set())
        setViolations(prev => prev.map(v => selectedIds.has(v.id) ? { ...v, status: 'takedown_sent' } : v))
      } else {
        const err = await res.json()
        showToast(`Error: ${err.error}`)
      }
    } catch (err) {
      showToast('Failed to send DMCA notice.')
    } finally {
      setSendingDmca(false)
    }
  }

  const filtered = filter === 'all' ? violations : violations.filter(v => v.status === filter)
  const filterBtns: Status[] = ['all', 'new', 'reviewed', 'takedown_sent', 'ignored']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Violations</h1>
          <p className="text-slate-400 text-sm mt-1">Review threats and send DMCA notices</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="primary" 
            disabled={selectedIds.size === 0}
            onClick={handleOpenComposer}
          >
            Send Takedown Notice ({selectedIds.size})
          </Button>
        </div>
      </div>

      {toast && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-sm">
          {toast}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {filterBtns.map(f => (
          <button
            key={f}
            id={`filter-${f}`}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize border ${
              filter === f
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {f.replace('_', ' ')}
            {f !== 'all' && (
              <span className="ml-1.5 text-slate-500">
                ({violations.filter(v => v.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-6 w-6 text-indigo-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
          </div>
        ) : filtered.length === 0 ? (
           <div className="text-center py-16">
            <p className="text-slate-400 font-medium">No violations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="py-3 px-2 text-left w-8"></th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Confidence</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Asset & URL</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Platform</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="py-3.5 px-2">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(v.id)}
                        onChange={() => toggleSelection(v.id)}
                        className="rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                      />
                    </td>
                    <td className="py-3.5 px-2">
                      <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getThreatLevelBg(v.confidence)} ${getThreatLevelColor(v.confidence)}`}>
                        {v.confidence}% {getThreatLevelLabel(v.confidence)}
                      </div>
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="text-slate-200 font-medium truncate max-w-[200px]">{v.assets?.title}</div>
                      <a href={v.found_url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline text-xs truncate max-w-[250px] block mt-1">
                        {v.found_url}
                      </a>
                    </td>
                    <td className="py-3.5 px-2"><Badge color="indigo">{v.platform}</Badge></td>
                    <td className="py-3.5 px-2"><Badge color={v.status === 'takedown_sent' ? 'blue' : v.status}>{v.status.replace('_', ' ')}</Badge></td>
                    <td className="py-3.5 px-2">
                      <div className="flex gap-2">
                        {v.status === 'new' && (
                          <Button variant="secondary" size="sm" loading={updating === v.id} onClick={() => updateStatus(v.id, 'reviewed')}>Review</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* DMCA Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-700/60 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Compose DMCA Takedown Notice</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">To (Recipient)</label>
                <input 
                  type="email" 
                  value={dmcaData.recipient} 
                  onChange={e => setDmcaData({...dmcaData, recipient: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Subject</label>
                <input 
                  type="text" 
                  value={dmcaData.subject} 
                  onChange={e => setDmcaData({...dmcaData, subject: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Body</label>
                <textarea 
                  value={dmcaData.body} 
                  onChange={e => setDmcaData({...dmcaData, body: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono h-64"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-700/60 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" loading={sendingDmca} onClick={handleSendDMCA}>Send Takedown Email</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
