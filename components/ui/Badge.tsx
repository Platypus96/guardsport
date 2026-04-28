type BadgeColor = 'new' | 'reviewed' | 'ignored' | 'indigo' | 'green'

interface BadgeProps {
  color?: BadgeColor
  children: React.ReactNode
  className?: string
}

const colorStyles: Record<BadgeColor, string> = {
  new: 'bg-red-500/15 text-red-400 border-red-500/30',
  reviewed: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  ignored: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  green: 'bg-green-500/15 text-green-400 border-green-500/30',
}

export function Badge({ color = 'indigo', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorStyles[color]} ${className}`}>
      {children}
    </span>
  )
}
