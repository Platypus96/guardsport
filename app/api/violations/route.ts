import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // First get the user's asset IDs
  const { data: userAssets } = await supabase
    .from('assets')
    .select('id')
    .eq('user_id', user.id)

  const assetIds = (userAssets || []).map((a: any) => a.id)

  if (assetIds.length === 0) return NextResponse.json([])

  // Fetch violations for those assets, join with asset title and url
  const { data, error } = await supabase
    .from('violations')
    .select('*, assets(title, url)')
    .in('asset_id', assetIds)
    .order('detected_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, status } = body

  if (!id || !status) {
    return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('violations')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
