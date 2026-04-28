import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/assets/fingerprint
 * Saves client-generated perceptual hashes to the database.
 * The video never touches the server — only tiny hash strings arrive here.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { asset_id, fingerprints } = body

  if (!asset_id || !fingerprints || !Array.isArray(fingerprints)) {
    return NextResponse.json({ error: 'Missing asset_id or fingerprints array' }, { status: 400 })
  }

  // Verify the asset belongs to this user
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .select('id')
    .eq('id', asset_id)
    .eq('user_id', user.id)
    .single()

  if (assetError || !asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  // Delete any existing fingerprints for this asset (re-fingerprint)
  await supabase
    .from('asset_fingerprints')
    .delete()
    .eq('asset_id', asset_id)

  // Insert new fingerprints
  const rows = fingerprints.map((fp: { frameIndex: number; hash: string }) => ({
    asset_id,
    frame_index: fp.frameIndex,
    phash: fp.hash,
  }))

  const { error: insertError } = await supabase
    .from('asset_fingerprints')
    .insert(rows)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Update asset status
  await supabase
    .from('assets')
    .update({ fingerprint_status: 'complete', fingerprint_count: fingerprints.length })
    .eq('id', asset_id)

  return NextResponse.json({ success: true, count: fingerprints.length })
}

/**
 * GET /api/assets/fingerprint?asset_id=xxx
 * Returns stored fingerprints for an asset.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const asset_id = searchParams.get('asset_id')

  if (!asset_id) return NextResponse.json({ error: 'Missing asset_id' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('asset_fingerprints')
    .select('frame_index, phash')
    .eq('asset_id', asset_id)
    .order('frame_index', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
