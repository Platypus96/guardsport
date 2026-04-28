export interface ViolationData {
  confidence: number
  platform: string
  detected_at?: string
}

/**
 * Calculates a dynamic Asset Threat Level (0-100) based on violation data.
 */
export function calculateAssetThreatLevel(violations: ViolationData[]): number {
  if (!violations || violations.length === 0) return 0

  // 1. Volume Component (Max 40 points)
  // More violations = higher threat. Capped at 10 violations.
  const volumeScore = Math.min(violations.length * 4, 40)

  // 2. Confidence Component (Max 30 points)
  // Higher confidence matches mean a more severe threat.
  const avgConfidence = violations.reduce((acc, v) => acc + v.confidence, 0) / violations.length
  const confidenceScore = (avgConfidence / 100) * 30

  // 3. Platform Spread Component (Max 15 points)
  // If piracy has spread to multiple platforms, it's harder to contain.
  const uniquePlatforms = new Set(violations.map(v => v.platform)).size
  const spreadScore = Math.min(uniquePlatforms * 5, 15)

  // 4. Recency Component (Max 15 points)
  // Recent violations are hotter threats. We'll look at the most recent violation.
  const now = new Date()
  let maxRecencyScore = 0
  
  violations.forEach(v => {
    const vDate = new Date(v.detected_at || Date.now())
    const daysOld = Math.max(0, (now.getTime() - vDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // 15 points if today, decaying to 0 points after 30 days
    let recency = 15 - (daysOld * 0.5)
    recency = Math.max(0, recency)
    
    if (recency > maxRecencyScore) maxRecencyScore = recency
  })

  const totalScore = volumeScore + confidenceScore + spreadScore + maxRecencyScore
  return Math.max(0, Math.min(100, Math.round(totalScore)))
}

export function getThreatLevelColor(score: number): string {
  if (score >= 75) return 'text-red-500' // Critical
  if (score >= 50) return 'text-orange-500' // High
  if (score >= 25) return 'text-yellow-400' // Moderate
  return 'text-emerald-500' // Safe
}

export function getThreatLevelBg(score: number): string {
  if (score >= 75) return 'bg-red-500/10 border-red-500/20'
  if (score >= 50) return 'bg-orange-500/10 border-orange-500/20'
  if (score >= 25) return 'bg-yellow-400/10 border-yellow-400/20'
  return 'bg-emerald-500/10 border-emerald-500/20'
}

export function getThreatLevelLabel(score: number): string {
  if (score >= 75) return 'Critical'
  if (score >= 50) return 'High'
  if (score >= 25) return 'Moderate'
  return 'Safe'
}
