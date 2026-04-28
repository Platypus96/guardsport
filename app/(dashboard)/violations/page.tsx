'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type Status = 'all' | 'new' | 'reviewed' | 'ignored'

interface Violation {
  id: string
  found_url: string
  platform: string
  status: 'new' | 'reviewed' | 'ignored'
  detected_at: string
  assets: { title: string }
}

export default function ViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/violations')
      .then(r => r.json())
      .then(data => { setViolations(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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

  const filtered = filter === 'all' ? violations : violations.filter(v => v.status === filter)

  const filterBtns: Status[] = ['all', 'new', 'reviewed', 'ignored']

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Violations</h1>
        <p className="text-slate-400 text-sm mt-1">Detected piracy instances across platforms</p>
      </div>

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
            {f}
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
            <svg className="animate-spin h-6 w-6 text-indigo-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">No violations found</p>
            <p className="text-slate-500 text-sm mt-1">
              {filter === 'all' ? 'Go to My Assets and run a scan to detect violations.' : `No ${filter} violations.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Asset</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Platform</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Found URL</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Date</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="py-3.5 px-2 text-slate-200 font-medium max-w-[160px] truncate">{v.assets?.title}</td>
                    <td className="py-3.5 px-2">
                      <Badge color="indigo">{v.platform}</Badge>
                    </td>
                    <td className="py-3.5 px-2">
                      <a href={v.found_url} target="_blank" rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline text-xs truncate max-w-[180px] block">
                        {v.found_url}
                      </a>
                    </td>
                    <td className="py-3.5 px-2">
                      <Badge color={v.status}>{v.status}</Badge>
                    </td>
                    <td className="py-3.5 px-2 text-slate-400 text-xs">
                      {new Date(v.detected_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-2">
                      {v.status === 'new' && (
                        <div className="flex gap-2">
                          <Button
                            id={`review-btn-${v.id}`}
                            variant="secondary"
                            size="sm"
                            loading={updating === v.id}
                            onClick={() => updateStatus(v.id, 'reviewed')}
                          >
                            Review
                          </Button>
                          <Button
                            id={`ignore-btn-${v.id}`}
                            variant="ghost"
                            size="sm"
                            loading={updating === v.id}
                            onClick={() => updateStatus(v.id, 'ignored')}
                          >
                            Ignore
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
