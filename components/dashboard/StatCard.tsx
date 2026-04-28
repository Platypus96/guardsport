interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color?: 'indigo' | 'red' | 'green' | 'blue'
}

const colorMap = {
  indigo: 'bg-indigo-500/15 text-indigo-400',
  red: 'bg-red-500/15 text-red-400',
  green: 'bg-green-500/15 text-green-400',
  blue: 'bg-blue-500/15 text-blue-400',
}

export function StatCard({ label, value, icon, color = 'indigo' }: StatCardProps) {
  return (
    <div className="group bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all duration-300 relative overflow-hidden">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40 bg-${color}-500 pointer-events-none`} />
      
      <div className="flex justify-between items-start z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-${color}-500/20 bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
          {icon}
        </div>
      </div>
      <div className="z-10 mt-2">
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
        <p className="text-sm text-slate-400 font-medium mt-1">{label}</p>
      </div>
    </div>
  )
}
