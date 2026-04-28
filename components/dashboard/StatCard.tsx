interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color?: 'indigo' | 'red' | 'green'
}

const colorMap = {
  indigo: 'bg-indigo-500/15 text-indigo-400',
  red: 'bg-red-500/15 text-red-400',
  green: 'bg-green-500/15 text-green-400',
}

export function StatCard({ label, value, icon, color = 'indigo' }: StatCardProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 flex items-center gap-4">
      <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  )
}
