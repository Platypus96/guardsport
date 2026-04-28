'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Column: Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 z-10 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="mx-auto w-full max-w-sm lg:w-96 relative">
          <Link href="/" className="inline-flex items-center gap-2 mb-10 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-bold text-white text-xl tracking-tight">GuardSport</span>
          </Link>

          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">Sign in to your account to manage your assets.</p>
          </div>

          <div className="mt-8">
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm shadow-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm shadow-sm"
                />
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/25 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </button>
            </form>

            {/* Social Proof / Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-950 text-slate-500">New to GuardSport?</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <Link
                  href="/signup"
                  className="w-full flex justify-center py-3 px-4 border border-slate-700 rounded-xl shadow-sm bg-slate-900/50 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Showcase */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-slate-900 justify-center items-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-purple-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-md w-full">
          <div className="p-8 rounded-[2rem] bg-slate-950/40 border border-slate-800 backdrop-blur-xl shadow-2xl">
            <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Threat Neutralized</p>
                  <p className="text-xs text-slate-400">Takedown sent to YouTube</p>
                </div>
                <div className="ml-auto text-xs font-mono text-slate-500">Just now</div>
              </div>
              <div className="h-px w-full bg-slate-800/50"></div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Fingerprint Generated</p>
                  <p className="text-xs text-slate-400">Match accuracy: 99.4%</p>
                </div>
                <div className="ml-auto text-xs font-mono text-slate-500">2m ago</div>
              </div>
              <div className="h-px w-full bg-slate-800/50"></div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Deep Scan Complete</p>
                  <p className="text-xs text-slate-400">3 new violations found</p>
                </div>
                <div className="ml-auto text-xs font-mono text-slate-500">15m ago</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <h3 className="text-white font-semibold">"Indispensable for our content team."</h3>
            <p className="text-slate-400 text-sm mt-2">GuardSport saves us hundreds of hours a month by automatically hunting down re-uploads across social media.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
