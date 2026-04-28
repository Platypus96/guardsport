import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/StatCard'
import { ViolationsChart } from '@/components/dashboard/ViolationsChart'
import { PlatformChart } from '@/components/dashboard/PlatformChart'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { calculateAssetThreatLevel, getThreatLevelColor, getThreatLevelBg, getThreatLevelLabel } from '@/lib/threat-score'

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

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Overview of your digital asset protection status</p>
        </div>
        
        {/* Portfolio Threat Level */}
        <div className={`px-4 py-2 rounded-lg border flex flex-col items-end ${getThreatLevelBg(overallThreat)}`}>
          <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Portfolio Threat</span>
          <div className={`text-xl font-black ${getThreatLevelColor(overallThreat)} flex items-center gap-2`}>
            {overallThreat}% <span className="text-sm font-medium">({getThreatLevelLabel(overallThreat)})</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Assets Registered"
          value={totalAssets}
          color="indigo"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          label="Total Violations"
          value={totalViolations}
          color="red"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Takedowns Sent"
          value={(violations ?? []).filter(v => v.status === 'takedown_sent').length}
          color="blue"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {/* Chart */}
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

      {/* Recent Violations */}
      <Card
        title="Recent Violations"
        action={
          <Link href="/violations" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            View all & manage takedowns →
          </Link>
        }
      >
        {recentViolations.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm">No violations detected yet.</p>
            <p className="text-slate-500 text-xs mt-1">
              Go to <Link href="/assets" className="text-indigo-400 hover:underline">My Assets</Link> and run a scan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="text-left py-2.5 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Confidence</th>
                  <th className="text-left py-2.5 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Asset</th>
                  <th className="text-left py-2.5 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Platform</th>
                  <th className="text-left py-2.5 px-2 text-xs uppercase tracking-wide text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentViolations.map((v: any) => (
                  <tr key={v.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-2">
                      <span className={`font-medium ${getThreatLevelColor(v.confidence)}`}>{v.confidence}%</span>
                    </td>
                    <td className="py-3 px-2 text-slate-200 font-medium max-w-[160px] truncate">
                      {v.assets?.title ?? '—'}
                    </td>
                    <td className="py-3 px-2">
                      <Badge color="indigo">{v.platform}</Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge color={v.status === 'takedown_sent' ? 'blue' : v.status}>{v.status.replace('_', ' ')}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
