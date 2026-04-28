'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { getThreatLevelColor, getThreatLevelBg, getThreatLevelLabel } from '@/lib/threat-score'

interface Asset {
  id: string
  title: string
  sport: string
  url: string
  created_at: string
  proof_hash?: string
  threat_score: number
  fingerprint_status?: string
  fingerprint_count?: number
}

interface ActionState {
  [assetId: string]: { loading: boolean; count?: number | null; error?: string | null; proving?: boolean }
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [actionStates, setActionStates] = useState<ActionState>({})
  const [toast, setToast] = useState<string | null>(null)

  const fetchAssets = () => {
    fetch('/api/assets')
      .then(r => r.json())
      .then(data => { 
        if (Array.isArray(data)) {
          setAssets(data)
        } else {
          console.error('Expected array, got:', data)
          setAssets([])
        }
        setLoading(false) 
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  async function handleScan(assetId: string) {
    setActionStates(prev => ({ ...prev, [assetId]: { ...prev[assetId], loading: true, count: null, error: null } }))
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset_id: assetId }),
      })
      const data = await res.json()
      setActionStates(prev => ({ ...prev, [assetId]: { ...prev[assetId], loading: false, count: data.count, error: null } }))
      showToast(data.count === 0 ? 'Scan complete — no violations found.' : `Scan found ${data.count} actionable threats!`)
      
      // Refresh the assets to get the new threat scores
      fetchAssets()
    } catch {
      setActionStates(prev => ({ ...prev, [assetId]: { ...prev[assetId], loading: false, count: null, error: 'Scan failed' } }))
    }
  }

  async function handleGenerateProof(assetId: string) {
    setActionStates(prev => ({ ...prev, [assetId]: { ...prev[assetId], proving: true } }))
    try {
      const res = await fetch('/api/assets/proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset_id: assetId }),
      })
      const data = await res.json()
      if (data.proof_hash) {
        setAssets(assets.map(a => a.id === assetId ? { ...a, proof_hash: data.proof_hash } : a))
        showToast('Cryptographic Proof generated successfully!')
      }
    } catch {
      showToast('Failed to generate proof.')
    } finally {
      setActionStates(prev => ({ ...prev, [assetId]: { ...prev[assetId], proving: false } }))
    }
  }

  function handleExportPDF(assetId: string) {
    window.open(`/api/reports?asset_id=${assetId}`, '_blank')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Assets</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your protected sports videos</p>
        </div>
        <Link href="/assets/new">
          <Button id="add-asset-btn" variant="primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Asset
          </Button>
        </Link>
      </div>

      {toast && (
        <div className="mb-4 p-3 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm">
          {toast}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-6 w-6 text-indigo-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-slate-400 font-medium">No assets registered yet</p>
            <p className="text-slate-500 text-sm mt-1">Add your first sports video to start monitoring</p>
            <Link href="/assets/new" className="mt-4 inline-block">
              <Button id="add-first-asset-btn" variant="primary" size="sm">Add your first asset</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Threat Level</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Title</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">URL</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Proof of Ownership</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => {
                  const state = actionStates[asset.id]
                  return (
                    <tr key={asset.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3.5 px-2">
                        <div className={`inline-flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 ${getThreatLevelBg(asset.threat_score)} ${getThreatLevelColor(asset.threat_score)}`}>
                          <span className="text-lg font-black">{asset.threat_score}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-slate-200 font-medium">
                        {asset.title}
                        <div className="mt-1 flex items-center gap-1.5">
                          <Badge color="indigo">{asset.sport}</Badge>
                          {asset.fingerprint_status === 'complete' && (
                            <Badge color="green">
                              <svg className="w-3 h-3 mr-0.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                              {asset.fingerprint_count} hashes
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-2">
                        <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline text-xs truncate max-w-[200px] block">
                          {asset.url}
                        </a>
                      </td>
                      <td className="py-3.5 px-2">
                        {asset.proof_hash ? (
                          <div className="flex items-center gap-1.5" title={asset.proof_hash}>
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-emerald-400 text-xs font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              0x{asset.proof_hash.substring(0, 8)}...
                            </span>
                          </div>
                        ) : (
                          <Button variant="secondary" size="sm" loading={state?.proving} onClick={() => handleGenerateProof(asset.id)} className="text-xs px-2 py-1 h-auto">
                            Generate Proof
                          </Button>
                        )}
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="flex gap-2">
                          <Button
                            id={`scan-btn-${asset.id}`}
                            variant="primary"
                            size="sm"
                            loading={state?.loading}
                            onClick={() => handleScan(asset.id)}
                          >
                            Scan Web
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleExportPDF(asset.id)} 
                            title="Download Evidence Report"
                            className="px-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
