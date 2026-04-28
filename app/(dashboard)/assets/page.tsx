'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card as UICard } from '@/components/ui/Card'
import { getThreatLevelColor, getThreatLevelBg, getThreatLevelLabel } from '@/lib/threat-score'
import { LayoutGrid, List, Search, Fingerprint, Link as LinkIcon, ShieldAlert, Download, RefreshCw, CheckSquare } from 'lucide-react'

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
  
  // UI States
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())

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
      fetchAssets()
    } catch {
      setActionStates(prev => ({ ...prev, [assetId]: { ...prev[assetId], loading: false, count: null, error: 'Scan failed' } }))
    }
  }

  async function handleBulkScan() {
    showToast(`Started bulk scan for ${selectedAssets.size} assets.`)
    for (const id of Array.from(selectedAssets)) {
      handleScan(id)
    }
    setSelectedAssets(new Set())
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

  function handleBulkExport() {
    showToast(`Exporting reports for ${selectedAssets.size} assets...`)
    // In a real app, this would generate a combined zip or run sequentially
    setSelectedAssets(new Set())
  }

  const toggleSelection = (id: string) => {
    const next = new Set(selectedAssets)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedAssets(next)
  }

  const toggleSelectAll = () => {
    if (selectedAssets.size === filteredAssets.length) {
      setSelectedAssets(new Set())
    } else {
      setSelectedAssets(new Set(filteredAssets.map(a => a.id)))
    }
  }

  const filteredAssets = useMemo(() => {
    return assets.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.sport.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [assets, searchQuery])

  // Asset Card Component
  const AssetCard = ({ asset }: { asset: Asset }) => {
    const state = actionStates[asset.id]
    const isSelected = selectedAssets.has(asset.id)
    const isFingerprinted = asset.fingerprint_status === 'complete'

    return (
      <div className={`relative p-5 rounded-2xl border transition-all duration-300 ${isSelected ? 'bg-indigo-900/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600/50'}`}>
        <div className="absolute top-4 right-4 flex gap-2">
          {isFingerprinted ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20" title="Fingerprinted Asset">
              <Fingerprint className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700" title="URL Monitored Asset">
              <LinkIcon className="w-4 h-4" />
            </div>
          )}
          <button 
            onClick={() => toggleSelection(asset.id)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${isSelected ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-950 text-slate-500 border-slate-700 hover:border-indigo-400'}`}
          >
            {isSelected && <CheckSquare className="w-4 h-4" />}
            {!isSelected && <div className="w-4 h-4 rounded-[3px] border border-slate-500" />}
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
              <circle 
                cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
                strokeDasharray={176} strokeDashoffset={176 - (176 * asset.threat_score) / 100}
                className={`transition-all duration-1000 ease-out ${getThreatLevelColor(asset.threat_score)}`} 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-lg font-black leading-none ${getThreatLevelColor(asset.threat_score)}`}>{asset.threat_score}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-200 truncate pr-8" title={asset.title}>{asset.title}</h3>
            <div className="flex gap-2 mt-1">
              <Badge color="indigo">{asset.sport}</Badge>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 mb-4 bg-slate-950/50 p-2 rounded-lg truncate" title={asset.url}>
          {asset.url}
        </div>

        {/* SHA-256 Proof Hash */}
        <div className="mb-4">
          {asset.proof_hash ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">SHA-256 Proof</span>
              </div>
              <p className="font-mono text-[10px] text-emerald-300/70 break-all leading-tight">{asset.proof_hash}</p>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleGenerateProof(asset.id)}
              loading={state?.proving}
              className="w-full border border-dashed border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-slate-400 hover:text-indigo-300 transition-all"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Generate SHA-256 Proof
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-auto">
          <div className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">
            Scanned recently
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleExportPDF(asset.id)} className="px-2" title="Download Report">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="primary" size="sm" loading={state?.loading} onClick={() => handleScan(asset.id)}>
              Scan
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* Header & View Toggles */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Assets</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and monitor your protected sports videos.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center bg-slate-900/50 border border-slate-700 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Link href="/assets/new">
            <Button variant="primary" className="rounded-xl shadow-lg shadow-indigo-500/20">
              Add Asset
            </Button>
          </Link>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      {selectedAssets.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-800/90 backdrop-blur-xl border border-slate-700 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <span className="text-indigo-400 font-bold text-xs">{selectedAssets.size}</span>
            </div>
            <span className="text-sm font-medium text-slate-200">assets selected</span>
          </div>
          <div className="w-px h-6 bg-slate-700" />
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={handleBulkExport} className="bg-slate-900 border-slate-700 hover:bg-slate-950">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="primary" size="sm" onClick={handleBulkScan} className="shadow-lg shadow-indigo-500/20">
              <RefreshCw className="w-4 h-4 mr-2" />
              Scan All
            </Button>
            <button onClick={() => setSelectedAssets(new Set())} className="text-xs text-slate-400 hover:text-slate-300 ml-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="animate-spin h-8 w-8 text-indigo-400" />
        </div>
      ) : assets.length === 0 ? (
        <UICard>
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-slate-800">
              <LayoutGrid className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-300 font-medium text-lg">No assets registered yet</p>
            <p className="text-slate-500 text-sm mt-1 mb-6">Add your first sports video to start monitoring for piracy.</p>
            <Link href="/assets/new">
              <Button variant="primary">Add your first asset</Button>
            </Link>
          </div>
        </UICard>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/20 rounded-2xl border border-dashed border-slate-700/50">
          <Search className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No assets match your search.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
        </div>
      ) : (
        /* Table View */
        <UICard>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="py-3 px-2 w-10">
                    <button onClick={toggleSelectAll} className="w-5 h-5 rounded border border-slate-600 flex items-center justify-center hover:border-indigo-400 transition-colors">
                      {selectedAssets.size > 0 && <CheckSquare className="w-4 h-4 text-indigo-400" />}
                    </button>
                  </th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Threat Level</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Title</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">URL</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">SHA-256 Proof</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map(asset => {
                  const state = actionStates[asset.id]
                  const isSelected = selectedAssets.has(asset.id)
                  return (
                    <tr key={asset.id} className={`border-b border-slate-700/30 transition-colors ${isSelected ? 'bg-indigo-500/5' : 'hover:bg-slate-800/40'}`}>
                      <td className="py-3 px-2">
                        <button onClick={() => toggleSelection(asset.id)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 hover:border-indigo-400'}`}>
                          {isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                        </button>
                      </td>
                      <td className="py-3 px-2">
                        <div className={`inline-flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 ${getThreatLevelBg(asset.threat_score)} ${getThreatLevelColor(asset.threat_score)}`}>
                          <span className="text-base font-black">{asset.threat_score}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-200 font-medium">
                        <div className="flex items-center gap-2 mb-1">
                          {asset.fingerprint_status === 'complete' ? <Fingerprint className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4 text-slate-500" />}
                          <span className="truncate max-w-[200px]" title={asset.title}>{asset.title}</span>
                        </div>
                        <Badge color="indigo">{asset.sport}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline text-xs truncate max-w-[200px] block font-mono bg-slate-900/50 p-1.5 rounded">
                          {asset.url}
                        </a>
                      </td>
                      <td className="py-3 px-2 max-w-[200px]">
                        {asset.proof_hash ? (
                          <div className="group relative">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Verified</span>
                            </div>
                            <p className="font-mono text-[9px] text-slate-400 truncate" title={asset.proof_hash}>{asset.proof_hash.slice(0, 16)}…</p>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateProof(asset.id)}
                            loading={state?.proving}
                            className="text-xs border border-dashed border-slate-700 hover:border-indigo-500/50 hover:text-indigo-300 text-slate-500 px-2 py-1 whitespace-nowrap"
                          >
                            + Generate Proof
                          </Button>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <Button variant="primary" size="sm" loading={state?.loading} onClick={() => handleScan(asset.id)}>
                            Scan Web
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleExportPDF(asset.id)} title="Download Evidence Report" className="px-2">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </UICard>
      )}
    </div>
  )
}
