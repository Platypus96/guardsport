import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center selection:bg-indigo-500/30 overflow-hidden">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
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
            <Button variant="primary" size="sm" className="shadow-lg shadow-indigo-500/20">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col items-center relative z-10 pb-20 pt-32">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/50 backdrop-blur-md text-slate-300 text-sm font-medium mb-8 shadow-sm transition-all hover:bg-slate-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Protecting Next-Gen Sports Media
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight max-w-4xl mb-6">
            Defend your sports assets from digital piracy.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
            GuardSport automates the detection of illegal streams and unauthorized uploads across the web. Secure your revenue and protect your broadcasting rights in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-24">
            <Link href="/signup">
              <Button variant="primary" className="h-14 px-8 text-lg font-semibold shadow-xl shadow-indigo-500/25 bg-indigo-600 hover:bg-indigo-500 transition-all rounded-xl">
                Start Scanning Free
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="h-14 px-8 text-lg font-medium bg-slate-800/80 hover:bg-slate-700 border-slate-600/50 backdrop-blur-md rounded-xl transition-all">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Mockup / Stats Row */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-32">
          {[
            { label: 'Violations Detected', value: '45,281+' },
            { label: 'Takedowns Sent', value: '12,940+' },
            { label: 'Accuracy Rate', value: '98.9%' },
            { label: 'Platforms Monitored', value: '50+' }
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md text-center flex flex-col justify-center transition-transform hover:-translate-y-1 hover:bg-slate-800/50 duration-300">
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="w-full max-w-6xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Everything you need to fight piracy.</h2>
            <p className="text-slate-400 text-lg">An end-to-end intelligence engine built specifically for video creators.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Automated Discovery', desc: 'Our AI generates smart search queries to find hidden streams and re-uploads that evade simple title searches.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', color: 'indigo' },
              { title: 'Perceptual Fingerprinting', desc: 'Identifies pirated videos even if they are re-encoded, cropped, or color-altered. Your video never leaves your browser.', icon: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.071 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4', color: 'emerald' },
              { title: 'Fuzzy Confidence Scoring', desc: 'Every discovered URL is scored from 0-100 based on Levenshtein distance and token overlap to eliminate false positives.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'blue' },
              { title: '1-Click DMCA Takedowns', desc: 'Review flagged content and instantly send auto-generated legal takedown notices via email with our integrated Resend API.', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'purple' },
              { title: 'Court-Ready Evidence', desc: 'Generate timestamped PDF/HTML evidence reports with full audit trails of when the piracy was detected and acted upon.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'rose' },
              { title: 'Portfolio Threat Scoring', desc: 'Monitor your entire asset library with a dynamic 0-100 threat gauge that factors in volume, spread, and recency.', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'amber' }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-${f.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  <svg className={`w-6 h-6 text-${f.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-xl text-white font-bold mb-3 tracking-tight">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* pHash Explanation Section */}
        <div className="w-full max-w-6xl mx-auto p-10 md:p-14 rounded-[2rem] bg-gradient-to-br from-indigo-900/30 to-slate-900 border border-indigo-500/20 shadow-2xl shadow-indigo-900/20 text-left overflow-hidden relative">
          {/* Decor */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Privacy-First Fingerprinting
              </div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight">How we catch altered pirated copies.</h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                Pirates try to hide by lowering quality, cropping edges, or changing colors. GuardSport catches them anyway using <strong className="text-white">Perceptual Hashing (pHash)</strong> — the same core tech behind YouTube Content ID.
              </p>
              <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 text-sm leading-relaxed">
                When you upload a video, <span className="text-indigo-300 font-medium">it never leaves your browser</span>. Instead, your browser extracts frames, shrinks them to 32x32 black-and-white squares, and generates a tiny mathematical "memory" of the core shapes. 
                <br /><br />
                The pirate's edits are lost in the shrinking process, but the core shapes remain identical — allowing our engine to flag it with 98% confidence.
              </div>
            </div>
            
            <div className="w-full md:w-[400px] aspect-square rounded-2xl bg-slate-950 border border-slate-800 p-8 flex flex-col justify-center gap-6 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e51a_1px,transparent_1px),linear-gradient(to_bottom,#4f46e51a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              {/* Pirate Video Box */}
              <div className="relative z-10 p-4 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-4 transform rotate-1 hover:rotate-0 transition-transform">
                <div className="w-12 h-12 rounded bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-20 bg-slate-700 rounded"></div>
                  <div className="h-2 w-32 bg-slate-800 rounded"></div>
                </div>
              </div>

              {/* Scanning Animation */}
              <div className="relative z-10 flex flex-col items-center gap-2 my-2">
                <div className="w-px h-8 bg-gradient-to-b from-transparent to-slate-600"></div>
                <svg className="w-6 h-6 text-slate-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                <div className="w-px h-8 bg-gradient-to-t from-transparent to-slate-600"></div>
              </div>

              {/* Hash Result Box */}
              <div className="relative z-10 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/40 flex items-center gap-4 transform -rotate-1 hover:rotate-0 transition-transform">
                <div className="w-12 h-12 rounded bg-indigo-600 flex items-center justify-center font-mono text-sm font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                  a4f2
                </div>
                <div className="flex-1 font-mono text-xs text-indigo-300 break-all leading-tight">
                  <span className="text-white font-bold">a4f2c89b7e31d056</span>
                  <br />
                  <span className="text-indigo-400/60 mt-1 block">64-bit Match Found</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-950/50 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-bold text-slate-300 tracking-tight">GuardSport</span>
            <span className="text-slate-600 text-sm ml-4">© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-white transition-colors">Log in</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
