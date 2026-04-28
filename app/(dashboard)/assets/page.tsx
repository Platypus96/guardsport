'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

interface Asset {
  id: string
  title: string
  sport: string
  url: string
  created_at: string
}

interface ScanResult {
  [assetId: string]: { loading: boolean; count: number | null; error: string | null }
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [scanResults, setScanResults] = useState<ScanResult>({})
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/assets')
      .then(r => r.json())
      .then(data => { setAssets(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  async function handleScan(assetId: string) {
    setScanResults(prev => ({ ...prev, [assetId]: { loading: true, count: null, error: null } }))
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset_id: assetId }),
      })
      const data = await res.json()
      setScanResults(prev => ({ ...prev, [assetId]: { loading: false, count: data.count, error: null } }))
      showToast(data.count === 0 ? 'Scan complete — no violations found.' : `Scan found ${data.count} violation${data.count > 1 ? 's' : ''}!`)
    } catch {
      setScanResults(prev => ({ ...prev, [assetId]: { loading: false, count: null, error: 'Scan failed' } }))
    }
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Asset
          </Button>
        </Link>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 p-3 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm">
          {toast}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-6 w-6 text-indigo-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
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
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Title</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Sport</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">URL</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Added</th>
                  <th className="text-left py-3 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => {
                  const sr = scanResults[asset.id]
                  return (
                    <tr key={asset.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3.5 px-2 text-slate-200 font-medium">{asset.title}</td>
                      <td className="py-3.5 px-2">
                        <Badge color="indigo">{asset.sport}</Badge>
                      </td>
                      <td className="py-3.5 px-2">
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:underline text-xs truncate max-w-xs block"
                        >
                          {asset.url}
                        </a>
                      </td>
                      <td className="py-3.5 px-2 text-slate-400 text-xs">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-2">
                        <Button
                          id={`scan-btn-${asset.id}`}
                          variant="secondary"
                          size="sm"
                          loading={sr?.loading}
                          onClick={() => handleScan(asset.id)}
                        >
                          Scan now
                        </Button>
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
