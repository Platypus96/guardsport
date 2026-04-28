import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calculateAssetThreatLevel } from '@/lib/threat-score'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch assets and their violations to calculate threat score
  const { data: assets, error } = await supabase
    .from('assets')
    .select('*, violations(confidence, platform, detected_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Attach threat_score to each asset
  const safeAssets = assets || []
  const assetsWithThreats = safeAssets.map(a => {
    const score = calculateAssetThreatLevel(a.violations || [])
    return { ...a, threat_score: score }
  })

  return NextResponse.json(assetsWithThreats)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  
  const { title, url, sport } = body
  if (!title || !url || !sport) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('assets')
    .insert([{ title, url, sport, user_id: user.id }])
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data[0])
}
