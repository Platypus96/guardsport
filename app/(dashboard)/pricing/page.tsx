import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-3">Simple, transparent pricing</h1>
        <p className="text-slate-400">Start for free, upgrade when you need to protect more assets.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-8 relative flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
            <p className="text-slate-400 text-sm h-10">Perfect for individuals and independent creators.</p>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-white">$0</span>
            <span className="text-slate-500">/month</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center text-slate-300 text-sm">
              <svg className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Protect up to 10 assets
            </li>
            <li className="flex items-center text-slate-300 text-sm">
              <svg className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Standard web scanning
            </li>
            <li className="flex items-center text-slate-300 text-sm">
              <svg className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Email alerts
            </li>
          </ul>
          
          <Button variant="secondary" className="w-full justify-center py-3" disabled>Current Plan</Button>
        </div>

        {/* Pro Plan */}
        <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-8 relative flex flex-col">
          <div className="absolute top-0 right-8 transform -translate-y-1/2">
            <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Most Popular
            </span>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <p className="text-indigo-200 text-sm h-10">For studios, broadcasters, and professional teams.</p>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-white">$99</span>
            <span className="text-indigo-300">/month</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center text-slate-300 text-sm">
              <svg className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <strong>Unlimited</strong> asset protection
            </li>
            <li className="flex items-center text-slate-300 text-sm">
              <svg className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              High-priority, deep-web scanning
            </li>
            <li className="flex items-center text-slate-300 text-sm">
              <svg className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Priority DMCA workflows
            </li>
            <li className="flex items-center text-slate-300 text-sm">
              <svg className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Web3 Proof of Ownership
            </li>
          </ul>
          
          <Button variant="primary" disabled className="w-full justify-center py-3 opacity-70 cursor-not-allowed">
            Coming Soon
          </Button>
        </div>
      </div>
    </div>
  )
}
