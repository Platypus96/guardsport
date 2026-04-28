'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartData {
  date: string
  count: number
}

interface ViolationsChartProps {
  data: ChartData[]
}

import { BarChart3 } from 'lucide-react'

export function ViolationsChart({ data }: ViolationsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-700/50">
        <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
          <BarChart3 className="w-6 h-6 text-slate-600" />
        </div>
        <p className="text-sm font-medium">No violations recorded</p>
        <p className="text-xs text-slate-600 mt-1">Data will appear here once scans complete.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
          cursor={{ fill: 'rgba(99,102,241,0.08)' }}
        />
        <Bar dataKey="count" name="Violations" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
