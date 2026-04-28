'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = {
  YouTube: '#ef4444',   // Red
  Twitter: '#3b82f6',   // Blue
  Telegram: '#0ea5e9',  // Light Blue
  Reddit: '#f97316',    // Orange
  Facebook: '#1877f2',  // Facebook Blue
  TikTok: '#000000',    // Black
  'Other Web': '#8b5cf6'// Purple
}

import { PieChart as PieChartIcon } from 'lucide-react'

export function PlatformChart({ data }: { data: { name: string, value: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-700/50">
        <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
          <PieChartIcon className="w-6 h-6 text-slate-600" />
        </div>
        <p className="text-sm font-medium">No platform data</p>
        <p className="text-xs text-slate-600 mt-1">Awaiting detection results.</p>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={(COLORS as any)[entry.name] || '#8b5cf6'} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
