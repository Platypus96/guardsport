'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const SPORTS = ['Football', 'Cricket', 'Basketball', 'Tennis', 'Baseball', 'Hockey', 'Other']

export default function NewAssetPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', url: '', sport: 'Football' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create asset')
      }
      router.push('/assets')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Add New Asset</h1>
        <p className="text-slate-400 text-sm mt-1">Register a sports video URL to start monitoring it for piracy</p>
      </div>

      <div className="max-w-xl">
        <Card>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1.5">
                Asset Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Premier League Highlights — Gameweek 32"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900/70 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
              />
            </div>

            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-slate-300 mb-1.5">
                Sport Category
              </label>
              <select
                id="sport"
                name="sport"
                value={form.sport}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900/70 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
              >
                {SPORTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-1.5">
                Video URL
              </label>
              <input
                id="url"
                name="url"
                type="url"
                required
                value={form.url}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900/70 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button id="submit-asset-btn" type="submit" variant="primary" loading={loading}>
                Register Asset
              </Button>
              <Button
                id="cancel-asset-btn"
                type="button"
                variant="ghost"
                onClick={() => router.push('/assets')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
