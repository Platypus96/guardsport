import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { Search, ScanEye, ShieldAlert, Zap, FileSearch, Activity, Play, Upload, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center selection:bg-indigo-500/30 overflow-hidden">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Sticky Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center backdrop-blur-md bg-slate-950/80 border-b border-white/5 transition-all duration-300">
        <nav className="w-full max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
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
      </div>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col items-center relative z-10 pb-20 pt-32">
        {/* Animated Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none animate-[pulse_6s_ease-in-out_infinite_1s]" />

        <div className="text-center flex flex-col items-center pt-8">
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

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
            <Link href="/signup">
              <Button variant="primary" className="h-14 px-8 text-lg font-semibold shadow-xl shadow-indigo-500/25 bg-indigo-600 hover:bg-indigo-500 transition-all rounded-xl">
                Start Scanning Free
                <Zap className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="h-14 px-8 text-lg font-medium bg-slate-800/80 hover:bg-slate-700 border-slate-600/50 backdrop-blur-md rounded-xl transition-all">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Product Mockup — Inline Dashboard Preview */}
        <div className="w-full max-w-5xl mx-auto mb-24 relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none h-full w-full rounded-2xl" />
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-35 transition duration-1000" />
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-indigo-500/10">
            {/* Browser Chrome */}
            <div className="flex items-center px-4 py-3 bg-slate-900 border-b border-slate-800 gap-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 bg-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-500 font-mono w-72">
                  <span className="text-indigo-400">🔒</span> app.guardsport.io/dashboard
                </div>
              </div>
            </div>
            {/* Dashboard Preview Body */}
            <div className="bg-slate-950 flex">
              {/* Sidebar */}
              <div className="w-44 bg-slate-900 border-r border-slate-800 p-3 space-y-2 hidden sm:block">
                <div className="px-2 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-indigo-500" />
                  <div className="h-2 w-16 bg-indigo-400/60 rounded" />
                </div>
                {[1,2,3,4].map(i => (
                  <div key={i} className="px-2 py-1.5 rounded-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-slate-700" />
                    <div className="h-2 rounded bg-slate-700" style={{ width: `${48 + i * 10}px` }} />
                  </div>
                ))}
              </div>
              {/* Main Content */}
              <div className="flex-1 p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="space-y-1">
                    <div className="h-3 w-40 bg-slate-200/10 rounded" />
                    <div className="h-2 w-24 bg-slate-600 rounded" />
                  </div>
                  <div className="h-8 w-28 bg-indigo-500 rounded-xl" />
                </div>
                {/* Stat Cards */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { color: 'bg-indigo-500/20', w: 'w-12', label: 'bg-slate-600' },
                    { color: 'bg-red-500/20', w: 'w-10', label: 'bg-slate-600' },
                    { color: 'bg-emerald-500/20', w: 'w-14', label: 'bg-slate-600' },
                    { color: 'bg-purple-500/20', w: 'w-10', label: 'bg-slate-600' },
                  ].map((c, i) => (
                    <div key={i} className="rounded-xl bg-slate-900 border border-slate-800 p-3 space-y-2">
                      <div className={`h-1.5 ${c.w} ${c.color} rounded`} />
                      <div className="h-4 w-8 bg-slate-200/20 rounded" />
                      <div className={`h-1.5 ${c.label} rounded w-full`} />
                    </div>
                  ))}
                </div>
                {/* Chart + Table area */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 rounded-xl bg-slate-900 border border-slate-800 p-4 h-28 flex flex-col gap-3">
                    <div className="h-2 w-20 bg-slate-700 rounded" />
                    <div className="flex-1 flex items-end gap-1">
                      {[40, 65, 30, 80, 55, 90, 45, 70, 35, 60].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 7 ? 'rgb(99 102 241 / 0.8)' : 'rgb(99 102 241 / 0.3)' }} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex flex-col gap-2 h-28">
                    <div className="h-2 w-16 bg-slate-700 rounded" />
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full border-4 border-indigo-500/40 border-t-indigo-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Stats Row */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-32">
          {[
            { label: 'Violations Detected', value: 45281, suffix: '+' },
            { label: 'Takedowns Sent', value: 12940, suffix: '+' },
            { label: 'Accuracy Rate', value: 98, suffix: '.9%' },
            { label: 'Platforms Monitored', value: 50, suffix: '+' }
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md text-center flex flex-col justify-center transition-transform hover:-translate-y-1 hover:bg-slate-800/50 duration-300">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* How it Works Stepper */}
        <div className="w-full max-w-5xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">How GuardSport Works</h2>
            <p className="text-slate-400 text-lg">Three simple steps to secure your content across the web.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center bg-slate-950 p-6 rounded-2xl w-full md:w-1/3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 mb-6 text-indigo-400">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1. Upload Asset</h3>
              <p className="text-slate-400 text-center text-sm">Upload your video file securely. We extract perceptual hashes locally in your browser.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center bg-slate-950 p-6 rounded-2xl w-full md:w-1/3">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 mb-6 text-purple-400">
                <ScanEye className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">2. Intelligent Scan</h3>
              <p className="text-slate-400 text-center text-sm">Our AI continuously monitors social platforms and streaming sites for matching hashes.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center bg-slate-950 p-6 rounded-2xl w-full md:w-1/3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mb-6 text-emerald-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3. Take Action</h3>
              <p className="text-slate-400 text-center text-sm">Review flagged violations and issue 1-click DMCA takedown notices instantly.</p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="w-full max-w-6xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Everything you need to fight piracy.</h2>
            <p className="text-slate-400 text-lg">An end-to-end intelligence engine built specifically for video creators.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Automated Discovery', desc: 'Our AI generates smart search queries to find hidden streams and re-uploads that evade simple title searches.', icon: Search, color: 'indigo' },
              { title: 'Perceptual Fingerprinting', desc: 'Identifies pirated videos even if they are re-encoded, cropped, or color-altered. Your video never leaves your browser.', icon: ScanEye, color: 'emerald' },
              { title: 'Fuzzy Confidence Scoring', desc: 'Every discovered URL is scored from 0-100 based on Levenshtein distance and token overlap to eliminate false positives.', icon: Activity, color: 'blue' },
              { title: '1-Click DMCA Takedowns', desc: 'Review flagged content and instantly send auto-generated legal takedown notices via email with our integrated Resend API.', icon: Zap, color: 'purple' },
              { title: 'Court-Ready Evidence', desc: 'Generate timestamped PDF/HTML evidence reports with full audit trails of when the piracy was detected and acted upon.', icon: FileSearch, color: 'rose' },
              { title: 'Portfolio Threat Scoring', desc: 'Monitor your entire asset library with a dynamic 0-100 threat gauge that factors in volume, spread, and recency.', icon: ShieldAlert, color: 'amber' }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl bg-slate-800/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner border border-slate-700/50 group-hover:border-${f.color}-500/50`}>
                  <f.icon className={`w-7 h-7 text-${f.color}-400`} />
                </div>
                <h3 className="text-xl text-white font-bold mb-3 tracking-tight">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* pHash Explanation Section */}
        <div className="w-full max-w-6xl mx-auto p-10 md:p-14 rounded-[2rem] bg-gradient-to-br from-indigo-900/30 to-slate-900 border border-indigo-500/20 shadow-2xl shadow-indigo-900/20 text-left overflow-hidden relative mb-32">
          {/* Decor */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
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
                  <Play className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-20 bg-slate-700 rounded"></div>
                  <div className="h-2 w-32 bg-slate-800 rounded"></div>
                </div>
              </div>

              {/* Scanning Animation */}
              <div className="relative z-10 flex flex-col items-center gap-2 my-2">
                <div className="w-px h-8 bg-gradient-to-b from-transparent to-slate-600"></div>
                <ScanEye className="w-6 h-6 text-slate-500 animate-bounce" />
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

        {/* Testimonials */}
        <div className="w-full max-w-6xl mx-auto mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Trusted by leading creators</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Alex Mercer", role: "Sports Broadcaster", quote: "GuardSport has single-handedly recovered over $10k in ad revenue for us this month alone by taking down unauthorized streams." },
              { name: "Sarah Jenkins", role: "MMA Content Creator", quote: "The perceptual hashing is like magic. People try to mirror or crop my fight breakdowns, and GuardSport flags them instantly." },
              { name: "David Thorne", role: "League Manager", quote: "Sending DMCAs used to take my team hours every week. Now it's literally a one-click process from the dashboard." }
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-900/30 border border-slate-800/60 flex flex-col relative">
                <div className="text-indigo-500/20 absolute top-4 left-4">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-slate-300 mb-6 mt-4 relative z-10">"{t.quote}"</p>
                <div className="mt-auto pt-6 border-t border-slate-800/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{t.name}</div>
                    <div className="text-slate-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-950/50 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-slate-300 tracking-tight">GuardSport</span>
            <span className="text-slate-600 text-sm ml-4">© {new Date().getFullYear()} All rights reserved. Built with ❤️</span>
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
