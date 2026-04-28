import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { scanForViolations } from '@/lib/scanner'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { asset_id } = body
  if (!asset_id) return NextResponse.json({ error: 'asset_id is required' }, { status: 400 })

  // Verify the asset belongs to this user
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .select('title, url')
    .eq('id', asset_id)
    .eq('user_id', user.id)
    .single()

  if (assetError || !asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  // Run the 3-Layer Intelligence Engine
  const violations = await scanForViolations(asset.title, asset.url)

  if (violations.length > 0) {
    // 1. Save violations to database with the new confidence and OG fields
    const rows = violations.map(v => ({ 
      asset_id, 
      found_url: v.found_url,
      platform: v.platform,
      confidence: v.confidence,
      og_title: v.og_title,
      has_video: v.has_video
    }))
    
    // We use upsert to avoid duplicate URLs for the same asset
    // Note: ensure there is a unique constraint on (asset_id, found_url) in a real prod env
    const { data: insertedViolations, error: insertError } = await supabase
      .from('violations')
      .insert(rows)
      .select('id')

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

    // 2. Log to Audit Trail (Evidence Chain)
    if (insertedViolations) {
      const events = insertedViolations.map((v: any, index: number) => ({
        violation_id: v.id,
        event_type: 'detected',
        details: `Detected with ${violations[index].confidence}% confidence.`
      }))
      await supabase.from('violation_events').insert(events)
    }

    // NOTE: We no longer auto-send emails. The user must review them in the Violations page.
  }

  return NextResponse.json({ count: violations.length })
}
