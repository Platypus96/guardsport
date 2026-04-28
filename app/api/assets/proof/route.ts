import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { asset_id } = body

  if (!asset_id) return NextResponse.json({ error: 'asset_id is required' }, { status: 400 })

  // Verify ownership
  const { data: asset, error: fetchError } = await supabase
    .from('assets')
    .select('*')
    .eq('id', asset_id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })

  if (asset.proof_hash) {
    return NextResponse.json({ proof_hash: asset.proof_hash }) // Already generated
  }

  // Generate SHA-256 cryptographic proof
  const payload = `${asset.id}|${asset.title}|${asset.url}|${asset.created_at}`
  const hash = crypto.createHash('sha256').update(payload).digest('hex')

  // Save to DB
  const { error: updateError } = await supabase
    .from('assets')
    .update({ proof_hash: hash })
    .eq('id', asset.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ proof_hash: hash })
}
