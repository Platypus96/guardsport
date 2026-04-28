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
    .select('title')
    .eq('id', asset_id)
    .eq('user_id', user.id)
    .single()

  if (assetError || !asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  // Run the scanner
  const violations = await scanForViolations(asset.title)

  if (violations.length > 0) {
    const rows = violations.map(v => ({ asset_id, ...v }))
    const { error: insertError } = await supabase.from('violations').insert(rows)
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ count: violations.length })
}
