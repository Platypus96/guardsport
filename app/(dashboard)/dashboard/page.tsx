import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/StatCard'
import { ViolationsChart } from '@/components/dashboard/ViolationsChart'
import { PlatformChart } from '@/components/dashboard/PlatformChart'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { calculateAssetThreatLevel, getThreatLevelColor, getThreatLevelBg, getThreatLevelLabel } from '@/lib/threat-score'
import { Button } from '@/components/ui/Button'
import { FileSearch, ShieldAlert, Zap, Activity } from 'lucide-react'

function buildLast7Days(violations: { detected_at: string }[]) {
  const days: { date: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const dateStr = d.toISOString().slice(0, 10)
    const count = violations.filter(v => v.detected_at?.slice(0, 10) === dateStr).length
    days.push({ date: label, count })
  }
  return days
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: assets } = await supabase
    .from('assets')
    .select('id, title, url')
    .eq('user_id', user?.id ?? '')

  const assetIds = (assets || []).map((a: any) => a.id)

  const violations = assetIds.length > 0
    ? (await supabase
        .from('violations')
        .select('id, status, detected_at, found_url, platform, confidence, asset_id, assets(title)')
        .in('asset_id', assetIds)
        .order('detected_at', { ascending: false })
      ).data
    : []

  const totalAssets = assets?.length ?? 0
  const totalViolations = violations?.length ?? 0
  const openViolations = violations?.filter(v => v.status === 'new').length ?? 0
  const chartData = buildLast7Days(violations ?? [])
  const recentViolations = (violations ?? []).slice(0, 5)

  // Calculate Platform Distribution
  const platformCounts: Record<string, number> = {}
  ;(violations ?? []).forEach(v => {
    platformCounts[v.platform] = (platformCounts[v.platform] || 0) + 1
  })
  const platformData = Object.keys(platformCounts).map(name => ({
    name,
    value: platformCounts[name]
  }))

  // Calculate Overall Portfolio Threat Level
  const overallThreat = calculateAssetThreatLevel(violations ?? [])

  // Time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-800/50">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
            {greeting}, <span className="text-indigo-400">{user?.email?.split('@')[0] || 'User'}</span> 👋
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Here's the latest intelligence on your digital assets.</p>
        </div>
        
        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/violations">
            <Button variant="secondary" className="bg-slate-800/50 hover:bg-slate-700/50 border-slate-700 rounded-xl font-medium text-sm">
              <Activity className="w-4 h-4 mr-2 text-blue-400" />
              View Reports
            </Button>
          </Link>
          <Link href="/assets">
            <Button variant="secondary" className="bg-slate-800/50 hover:bg-slate-700/50 border-slate-700 rounded-xl font-medium text-sm">
              <FileSearch className="w-4 h-4 mr-2 text-emerald-400" />
              Scan All
            </Button>
          </Link>
          <Link href="/assets/new">
            <Button variant="primary" className="shadow-lg shadow-indigo-500/20 rounded-xl font-medium text-sm">
              <Zap className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </Link>
          
          <div className={`ml-2 px-5 py-2 rounded-xl border flex flex-col items-center shadow-sm ${getThreatLevelBg(overallThreat)}`}>
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">Portfolio Threat</span>
            <div className={`text-xl font-black ${getThreatLevelColor(overallThreat)} leading-none`}>
              {overallThreat}%
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Assets Monitored"
          value={totalAssets}
          color="indigo"
          icon={<ShieldAlert className="w-5 h-5" />}
          trend={{ value: 12, label: 'vs last week' }}
        />
        <StatCard
          label="Total Violations"
          value={totalViolations}
          color="red"
          icon={<Activity className="w-5 h-5" />}
          trend={{ value: 5, label: 'vs last week' }}
        />
        <StatCard
          label="Takedowns Sent"
          value={(violations ?? []).filter(v => v.status === 'takedown_sent').length}
          color="blue"
          icon={<Zap className="w-5 h-5" />}
          trend={{ value: 24, label: 'vs last week' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card title="Violations — Last 7 Days">
            <ViolationsChart data={chartData} />
          </Card>
        </div>
        <div>
          <Card title="Threats by Platform">
            <PlatformChart data={platformData} />
          </Card>
        </div>
      </div>

      {/* Activity Feed Widget */}
      <Card
        title="Recent Activity"
        action={
          <Link href="/violations" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            View all violations →
          </Link>
        }
      >
        {recentViolations.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/20 rounded-xl border border-dashed border-slate-700/50 mt-2">
            <p className="text-slate-400 text-sm">No activity recorded yet.</p>
            <p className="text-slate-500 text-xs mt-1">
              Add assets and run a scan to populate this feed.
            </p>
          </div>
        ) : (
          <div className="relative border-l border-slate-800 ml-3 mt-4 space-y-8 pb-4">
            {recentViolations.map((v: any, index: number) => {
              const isTakedown = v.status === 'takedown_sent';
              const isNew = v.status === 'new';
              
              return (
                <div key={v.id} className="relative pl-6 group">
                  <span className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-slate-900 ${isTakedown ? 'bg-blue-500' : isNew ? 'bg-red-500' : 'bg-slate-500'} group-hover:scale-125 transition-transform`}></span>
                  
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                    <h4 className="text-sm font-semibold text-slate-200">
                      {isTakedown ? 'DMCA Takedown Sent' : isNew ? 'New Violation Detected' : 'Violation Reviewed'}
                    </h4>
                    <time className="text-xs text-slate-500 font-mono mt-1 sm:mt-0">
                      {new Date(v.detected_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </time>
                  </div>
                  
                  <div className="text-sm text-slate-400 bg-slate-900/40 border border-slate-800 rounded-lg p-3 mt-2 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                        {v.platform}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getThreatLevelBg(v.confidence)} ${getThreatLevelColor(v.confidence)}`}>
                        {v.confidence}% Match
                      </span>
                    </div>
                    <p className="truncate text-slate-300 mb-1 font-medium">
                      Asset: {v.assets?.title ?? 'Unknown Asset'}
                    </p>
                    <a href={v.found_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline truncate block w-full">
                      {v.found_url}
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
