import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { violation_ids, recipient_email, subject, email_body } = body

  if (!violation_ids || !recipient_email || !subject || !email_body) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify ownership: check that the violations belong to the user via their assets
  const { data: violations, error: fetchError } = await supabase
    .from('violations')
    .select('id, asset_id')
    .in('id', violation_ids)

  if (fetchError || !violations) {
    return NextResponse.json({ error: 'Violations not found' }, { status: 404 })
  }

  // Get user's asset IDs to verify ownership
  const { data: userAssets } = await supabase
    .from('assets')
    .select('id')
    .eq('user_id', user.id)

  const userAssetIds = new Set((userAssets || []).map((a: any) => a.id))

  for (const v of violations) {
    if (!userAssetIds.has(v.asset_id)) {
      return NextResponse.json({ error: 'Unauthorized violation access' }, { status: 403 })
    }
  }

  // Send the email via Resend
  try {
    const result = await resend.emails.send({
      from: 'GuardSport DMCA <onboarding@resend.dev>',
      to: recipient_email,
      subject: subject,
      text: email_body,
    })

    if (result.error) throw new Error(result.error.message)

    // Update statuses and write to audit trail
    await supabase
      .from('violations')
      .update({ status: 'takedown_sent' })
      .in('id', violation_ids)

    const events = violation_ids.map((id: string) => ({
      violation_id: id,
      event_type: 'takedown_sent',
      details: `DMCA notice sent to ${recipient_email}`
    }))
    await supabase.from('violation_events').insert(events)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
