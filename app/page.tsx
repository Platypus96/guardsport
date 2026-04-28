import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center selection:bg-indigo-500/30 overflow-hidden">
      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold text-white text-xl tracking-tight">GuardSport</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center relative z-10 py-20">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
          Protecting Next-Gen Sports Media
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight max-w-4xl mb-6">
          Defend your sports assets from digital piracy.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          GuardSport automates the detection of illegal streams and unauthorized uploads across the web. Secure your revenue and protect your broadcasting rights in real-time.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signup">
            <Button variant="primary" className="h-12 px-8 text-base shadow-lg shadow-indigo-500/25">
              Start Scanning Free
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="h-12 px-8 text-base bg-slate-800/80 backdrop-blur-md">
              View Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left w-full">
          {[
            { title: 'Automated Detection', desc: 'Continuous scanning across major social and streaming platforms.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
            { title: 'Instant Analytics', desc: 'Real-time dashboard showing violation statuses and historical trends.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { title: 'One-Click Action', desc: 'Review, ignore, or issue takedown notices directly from the interface.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* pHash Explanation Section */}
        <div className="w-full mt-24 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 text-left">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Privacy-First Fingerprinting
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">How we catch altered pirated copies.</h2>
              <p className="text-slate-300 leading-relaxed">
                Pirates try to hide by lowering quality, cropping edges, or changing colors. GuardSport catches them anyway using <strong>Perceptual Hashing (pHash)</strong> — the same core tech behind YouTube Content ID.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                When you upload a video, it never leaves your browser. Instead, your browser extracts frames, shrinks them to 32x32 black-and-white squares, and generates a tiny mathematical "memory" of the core shapes. When our scanner finds a suspicious video, it repeats the process. 
                <br /><br />
                The pirate's edits are lost in the shrinking process, but the core shapes remain identical — allowing our engine to flag it with 98% confidence.
              </p>
            </div>
            <div className="w-full md:w-1/3 aspect-square rounded-2xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-center gap-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e51a_1px,transparent_1px),linear-gradient(to_bottom,#4f46e51a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              <div className="relative z-10 p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-indigo-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1">
                  <div className="h-2 w-16 bg-slate-700 rounded mb-1.5"></div>
                  <div className="h-2 w-24 bg-slate-800 rounded"></div>
                </div>
              </div>

              <div className="relative z-10 flex justify-center">
                <svg className="w-5 h-5 text-slate-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </div>

              <div className="relative z-10 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-indigo-500 flex items-center justify-center font-mono text-xs font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                  a4f2
                </div>
                <div className="flex-1 font-mono text-[10px] text-indigo-300 break-all leading-tight">
                  a4f2c89b7e31d056
                  <br />
                  <span className="text-slate-500">64-bit Hash</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
