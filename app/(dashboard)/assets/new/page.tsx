'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { fingerprintVideo } from '@/lib/phash'

const SPORTS = ['Football', 'Cricket', 'Basketball', 'Tennis', 'Baseball', 'Hockey', 'Other']
const ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']

type UploadMode = 'url' | 'file'

interface FingerprintProgress {
  stage: string
  current: number
  total: number
}

export default function NewAssetPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<UploadMode>('url')
  const [form, setForm] = useState({ title: '', url: '', sport: 'Football' })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // Fingerprinting state
  const [fingerprinting, setFingerprinting] = useState(false)
  const [fpProgress, setFpProgress] = useState<FingerprintProgress | null>(null)
  const [fpComplete, setFpComplete] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // ─── Drag & Drop ──────────────────────────────────────────

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file && ACCEPTED_TYPES.includes(file.type)) {
      setVideoFile(file)
      setError('')
      // Auto-fill title from filename if empty
      if (!form.title) {
        const name = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')
        setForm(prev => ({ ...prev, title: name }))
      }
    } else {
      setError('Invalid file type. Please use MP4, WebM, MOV, or AVI.')
    }
  }, [form.title])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      setError('')
      if (!form.title) {
        const name = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')
        setForm(prev => ({ ...prev, title: name }))
      }
    }
  }

  // ─── Fingerprint ──────────────────────────────────────────

  async function handleFingerprint(assetId: string) {
    if (!videoFile) return

    setFingerprinting(true)
    setFpProgress({ stage: 'Initializing...', current: 0, total: 10 })

    try {
      const fingerprints = await fingerprintVideo(videoFile, 10, (current, total, stage) => {
        setFpProgress({ stage, current, total })
      })

      setFpProgress({ stage: 'Saving fingerprints...', current: 10, total: 10 })

      // Save fingerprints to database (only tiny hash strings are sent)
      await fetch('/api/assets/fingerprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset_id: assetId, fingerprints }),
      })

      setFpComplete(true)
      setFpProgress({ stage: 'Complete!', current: 10, total: 10 })
    } catch (err) {
      console.error('Fingerprinting failed:', err)
      setError('Fingerprinting failed. Asset was still registered successfully.')
    } finally {
      setFingerprinting(false)
    }
  }

  // ─── Submit ───────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate
    if (mode === 'url' && !form.url) {
      setError('Please enter a video URL')
      setLoading(false)
      return
    }
    if (mode === 'file' && !videoFile) {
      setError('Please select a video file')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          url: mode === 'url' ? form.url : `local://${videoFile!.name}`,
          sport: form.sport,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create asset')
      }

      const asset = await res.json()

      // If file mode, fingerprint the video
      if (mode === 'file' && videoFile) {
        setLoading(false)
        await handleFingerprint(asset.id)
        // Wait a beat then redirect
        setTimeout(() => router.push('/assets'), 1500)
      } else {
        router.push('/assets')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  // ─── Progress Bar ─────────────────────────────────────────

  const progressPercent = fpProgress
    ? Math.round((fpProgress.current / fpProgress.total) * 100)
    : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Add New Asset</h1>
        <p className="text-slate-400 text-sm mt-1">Register a sports video to start monitoring it for piracy</p>
      </div>

      <div className="max-w-xl">
        <Card>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                mode === 'url'
                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                Paste URL
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode('file')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                mode === 'file'
                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                Upload Video
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
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

            {/* Sport */}
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

            {/* URL Input (URL mode) */}
            {mode === 'url' && (
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Video URL
                </label>
                <input
                  id="url"
                  name="url"
                  type="url"
                  required={mode === 'url'}
                  value={form.url}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900/70 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                />
              </div>
            )}

            {/* Drag & Drop Zone (File mode) */}
            {mode === 'file' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Video File
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : videoFile
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-slate-600 bg-slate-900/30 hover:border-slate-500 hover:bg-slate-900/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {videoFile ? (
                    <div>
                      <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <p className="text-emerald-400 font-medium text-sm">{videoFile.name}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB • Click or drop to replace
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      </div>
                      <p className="text-slate-300 font-medium text-sm">Drop your video here, or click to browse</p>
                      <p className="text-slate-500 text-xs mt-1">MP4, WebM, MOV, AVI — processed locally, never uploaded</p>
                    </div>
                  )}
                </div>

                {/* Privacy Notice */}
                <div className="mt-2 flex items-start gap-2 p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/40">
                  <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    <span className="text-emerald-400 font-medium">Privacy-first:</span> Your video is processed entirely in your browser. 
                    Only tiny fingerprint hashes (~500 bytes) are saved — the video file never leaves your device.
                  </p>
                </div>
              </div>
            )}

            {/* Fingerprinting Progress */}
            {fingerprinting && fpProgress && (
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="animate-spin h-4 w-4 text-indigo-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                  <span className="text-indigo-400 text-sm font-medium">{fpProgress.stage}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1.5">
                  Frame {fpProgress.current} of {fpProgress.total} • {progressPercent}%
                </p>
              </div>
            )}

            {/* Fingerprint Complete */}
            {fpComplete && (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <p className="text-emerald-400 text-sm font-medium">Fingerprint generated!</p>
                  <p className="text-slate-500 text-xs">10 perceptual hashes saved. Redirecting...</p>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                id="submit-asset-btn"
                type="submit"
                variant="primary"
                loading={loading || fingerprinting}
                disabled={fingerprinting || fpComplete}
              >
                {mode === 'file' ? 'Register & Fingerprint' : 'Register Asset'}
              </Button>
              <Button
                id="cancel-asset-btn"
                type="button"
                variant="ghost"
                onClick={() => router.push('/assets')}
                disabled={fingerprinting}
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
