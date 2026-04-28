'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { fingerprintVideo } from '@/lib/phash'
import { UploadCloud, Link as LinkIcon, Film, CheckCircle2, Loader2, Fingerprint, ShieldAlert } from 'lucide-react'

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
  const videoRef = useRef<HTMLVideoElement>(null)

  const [mode, setMode] = useState<UploadMode>('url')
  const [form, setForm] = useState({ title: '', url: '', sport: 'Football' })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // Fingerprinting state
  const [fingerprinting, setFingerprinting] = useState(false)
  const [fpProgress, setFpProgress] = useState<FingerprintProgress | null>(null)
  const [fpComplete, setFpComplete] = useState(false)
  
  // Clean up object URL
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    }
  }, [videoPreviewUrl])

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

  const handleFile = (file: File) => {
    if (file && ACCEPTED_TYPES.includes(file.type)) {
      setVideoFile(file)
      
      // Create preview
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
      setVideoPreviewUrl(URL.createObjectURL(file))
      
      setError('')
      // Auto-fill title from filename if empty
      if (!form.title) {
        const name = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')
        setForm(prev => ({ ...prev, title: name }))
      }
    } else {
      setError('Invalid file type. Please use MP4, WebM, MOV, or AVI.')
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [form.title, videoPreviewUrl])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
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

      // Save fingerprints to database
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

      if (mode === 'file' && videoFile) {
        setLoading(false)
        await handleFingerprint(asset.id)
        setTimeout(() => router.push('/assets'), 2000)
      } else {
        router.push('/assets')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  // ─── UI Helpers ─────────────────────────────────────────

  const currentStep = fingerprinting || fpComplete ? 3 : videoFile || (mode === 'url' && form.url) ? 2 : 1

  return (
    <div className="pb-12 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Add New Asset</h1>
        <p className="text-slate-400 text-sm mt-2">Register a sports video to start monitoring it for piracy</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-10 flex items-center justify-center max-w-2xl mx-auto">
        <div className="flex items-center w-full">
          <div className={`flex flex-col items-center flex-1 transition-all ${currentStep >= 1 ? 'text-indigo-400' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${currentStep >= 1 ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-700 bg-slate-800'}`}>
              <Film className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">Details</span>
          </div>
          <div className={`h-px w-16 md:w-32 transition-all ${currentStep >= 2 ? 'bg-indigo-500/50' : 'bg-slate-700'}`} />
          <div className={`flex flex-col items-center flex-1 transition-all ${currentStep >= 2 ? 'text-indigo-400' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${currentStep >= 2 ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-700 bg-slate-800'}`}>
              <UploadCloud className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">Source</span>
          </div>
          <div className={`h-px w-16 md:w-32 transition-all ${currentStep >= 3 ? 'bg-indigo-500/50' : 'bg-slate-700'}`} />
          <div className={`flex flex-col items-center flex-1 transition-all ${currentStep >= 3 ? 'text-indigo-400' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${currentStep >= 3 ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-700 bg-slate-800'}`}>
              <Fingerprint className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">Protect</span>
          </div>
        </div>
      </div>

      <Card className="shadow-2xl shadow-indigo-500/5">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex bg-slate-900/50 p-1 rounded-xl mb-8 border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              mode === 'url'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Paste URL
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              mode === 'file'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload Video
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                Asset Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Premier League Highlights"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm shadow-inner"
              />
            </div>

            {/* Sport */}
            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-slate-300 mb-2">
                Sport Category
              </label>
              <select
                id="sport"
                name="sport"
                value={form.sport}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm shadow-inner"
              >
                {SPORTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* URL Input (URL mode) */}
          {mode === 'url' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-2">
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
                className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm shadow-inner"
              />
              <p className="text-xs text-slate-500 mt-2 ml-1">We will continuously monitor this URL for unauthorized copies across the web.</p>
            </div>
          )}

          {/* Drag & Drop Zone (File mode) */}
          {mode === 'file' && !fingerprinting && !fpComplete && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Source Video
              </label>
              
              {!videoFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
                      : 'border-slate-700 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-800/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 shadow-inner border border-slate-700">
                    <UploadCloud className={`w-8 h-8 transition-colors ${dragActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  </div>
                  <h3 className="text-slate-200 font-semibold text-lg mb-1">Drop your video here</h3>
                  <p className="text-slate-400 text-sm mb-4">or click to browse from your computer</p>
                  <p className="text-slate-500 text-xs">MP4, WebM, MOV, AVI (Max 500MB)</p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 flex flex-col sm:flex-row animate-in zoom-in-95 duration-300">
                  <div className="w-full sm:w-1/3 bg-black relative aspect-video sm:aspect-auto">
                    {videoPreviewUrl && (
                      <video 
                        ref={videoRef}
                        src={videoPreviewUrl} 
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                        controls={false}
                        muted
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                      <span className="text-xs font-mono bg-black/60 text-white px-2 py-1 rounded backdrop-blur-md">Preview</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-semibold text-slate-200 truncate">{videoFile.name}</h4>
                    </div>
                    <p className="text-slate-400 text-sm ml-8 mb-4">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                    <div className="ml-8">
                      <Button variant="secondary" size="sm" onClick={() => { setVideoFile(null); setVideoPreviewUrl(null) }}>
                        Replace Video
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <Fingerprint className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-400 text-sm leading-relaxed">
                  <span className="text-emerald-400 font-medium">Privacy-first processing:</span> Your video is processed entirely in your browser. 
                  Only mathematical perceptual hashes are saved to our servers. The video file never leaves your device.
                </p>
              </div>
            </div>
          )}

          {/* Fingerprinting Visualization */}
          {(fingerprinting || fpComplete) && (
            <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 border border-indigo-500/30 bg-slate-900/80 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                  style={{ width: `${fpProgress ? (fpProgress.current / fpProgress.total) * 100 : 0}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {fpComplete ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  )}
                  <div>
                    <h3 className="text-white font-semibold">{fpProgress?.stage || 'Processing...'}</h3>
                    <p className="text-slate-400 text-sm">
                      {fpComplete ? 'Cryptographic proofs secured' : `Extracting frame ${fpProgress?.current || 0} of ${fpProgress?.total || 10}`}
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-mono text-indigo-400 font-bold">
                  {Math.round(fpProgress ? (fpProgress.current / fpProgress.total) * 100 : 0)}%
                </div>
              </div>

              {/* Grid of hashes */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => {
                  const isActive = fpProgress && i < fpProgress.current
                  const isCurrent = fpProgress && i === fpProgress.current
                  return (
                    <div 
                      key={i} 
                      className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-2 transition-all duration-500 ${
                        isActive 
                          ? 'border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                          : isCurrent
                            ? 'border-indigo-500 bg-indigo-500/10 animate-pulse'
                            : 'border-slate-800 bg-slate-900/50'
                      }`}
                    >
                      <Fingerprint className={`w-6 h-6 mb-2 ${isActive ? 'text-emerald-400' : isCurrent ? 'text-indigo-400' : 'text-slate-700'}`} />
                      {isActive ? (
                        <span className="text-[10px] font-mono text-emerald-300/70 truncate w-full text-center">
                          0x{Math.random().toString(16).slice(2, 8)}
                        </span>
                      ) : (
                        <div className="w-8 h-1 rounded-full bg-slate-800" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/assets')}
              disabled={fingerprinting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-8 shadow-lg shadow-indigo-500/20"
              loading={loading || fingerprinting}
              disabled={fingerprinting || fpComplete}
            >
              {mode === 'file' ? 'Protect Asset' : 'Start Monitoring'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
