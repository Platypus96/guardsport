import { AnimatedCounter } from '@/components/AnimatedCounter'

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color?: 'indigo' | 'red' | 'green' | 'blue'
  trend?: {
    value: number
    label?: string
  }
}

const colorMap = {
  indigo: 'bg-indigo-500/15 text-indigo-400',
  red: 'bg-red-500/15 text-red-400',
  green: 'bg-green-500/15 text-green-400',
  blue: 'bg-blue-500/15 text-blue-400',
}

export function StatCard({ label, value, icon, color = 'indigo', trend }: StatCardProps) {
  return (
    <div className="group bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-slate-800/60 hover:border-slate-600/50 hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40 bg-${color}-500 pointer-events-none`} />
      
      <div className="flex justify-between items-start z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-${color}-500/20 bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
          {icon}
        </div>
      </div>
      <div className="z-10 mt-2">
        <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
          {typeof value === 'number' ? <AnimatedCounter value={value} duration={1000} /> : value}
        </div>
        <div className="flex items-center mt-1 gap-2">
          <p className="text-sm text-slate-400 font-medium">{label}</p>
          {trend && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center ${trend.value >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              {trend.label && <span className="font-normal opacity-80 ml-1">{trend.label}</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
