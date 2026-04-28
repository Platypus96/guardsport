import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const asset_id = searchParams.get('asset_id')

  if (!asset_id) return new NextResponse('Missing asset_id', { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  // Fetch Asset Data
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .select('*')
    .eq('id', asset_id)
    .eq('user_id', user.id)
    .single()

  if (assetError || !asset) return new NextResponse('Asset not found', { status: 404 })

  // Fetch Violations
  const { data: violations } = await supabase
    .from('violations')
    .select('*')
    .eq('asset_id', asset_id)
    .order('confidence', { ascending: false })

  // Fetch Audit Trail
  const violationIds = (violations || []).map(v => v.id)
  const { data: events } = violationIds.length > 0
    ? await supabase
        .from('violation_events')
        .select('*, violations(found_url)')
        .in('violation_id', violationIds)
        .order('created_at', { ascending: true })
    : { data: [] }

  // Build a JSON report (HTML alternative to PDF - avoids font loading issues)
  const report = {
    generated_at: new Date().toUTCString(),
    asset: {
      title: asset.title,
      url: asset.url,
      registered: new Date(asset.created_at).toUTCString(),
      proof_hash: asset.proof_hash ? `0x${asset.proof_hash}` : 'Not Generated',
    },
    violations: (violations || []).map(v => ({
      platform: v.platform,
      confidence: `${v.confidence}%`,
      found_url: v.found_url,
      og_title: v.og_title,
      has_video: v.has_video,
      status: v.status,
      detected_at: new Date(v.detected_at).toUTCString(),
    })),
    audit_trail: (events || []).map((e: any) => ({
      timestamp: new Date(e.created_at).toUTCString(),
      event_type: e.event_type.toUpperCase(),
      violation_url: e.violations?.found_url,
      details: e.details,
    })),
  }

  // Generate a simple HTML report instead of PDF (no font files needed)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GuardSport Evidence Report – ${asset.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1 { color: #4f46e5; }
    h2 { color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 32px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th { background: #f1f5f9; text-align: left; padding: 10px 12px; color: #64748b; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; word-break: break-all; }
    .badge-high { background: #fee2e2; color: #dc2626; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .badge-med { background: #fef3c7; color: #d97706; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .badge-low { background: #dcfce7; color: #16a34a; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .proof { font-family: monospace; background: #f1f5f9; padding: 8px 12px; border-radius: 6px; font-size: 12px; word-break: break-all; }
    .meta { color: #64748b; font-size: 13px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>🛡 GuardSport Evidence Report</h1>
  <p class="meta">Generated: ${report.generated_at}</p>

  <h2>1. Protected Asset</h2>
  <table>
    <tr><th>Field</th><th>Value</th></tr>
    <tr><td>Title</td><td><strong>${report.asset.title}</strong></td></tr>
    <tr><td>Source URL</td><td><a href="${report.asset.url}">${report.asset.url}</a></td></tr>
    <tr><td>Registered Date</td><td>${report.asset.registered}</td></tr>
    <tr><td>Proof of Ownership Hash</td><td><span class="proof">${report.asset.proof_hash}</span></td></tr>
  </table>

  <h2>2. Detected Violations (${report.violations.length})</h2>
  ${report.violations.length === 0 ? '<p>No violations detected.</p>' : `
  <table>
    <tr><th>Platform</th><th>Confidence</th><th>Found URL</th><th>Status</th><th>Detected At</th></tr>
    ${report.violations.map(v => `
      <tr>
        <td>${v.platform}</td>
        <td><span class="${parseInt(v.confidence) >= 75 ? 'badge-high' : parseInt(v.confidence) >= 50 ? 'badge-med' : 'badge-low'}">${v.confidence}</span></td>
        <td><a href="${v.found_url}">${v.found_url}</a></td>
        <td>${v.status}</td>
        <td>${v.detected_at}</td>
      </tr>
    `).join('')}
  </table>`}

  <h2>3. Chain of Evidence (Audit Trail)</h2>
  ${report.audit_trail.length === 0 ? '<p>No audit events found.</p>' : `
  <table>
    <tr><th>Timestamp</th><th>Event</th><th>Details</th></tr>
    ${report.audit_trail.map(e => `
      <tr>
        <td>${e.timestamp}</td>
        <td><strong>${e.event_type}</strong></td>
        <td>${e.violation_url ?? ''}<br><small>${e.details ?? ''}</small></td>
      </tr>
    `).join('')}
  </table>`}

  <p class="meta" style="margin-top: 40px;">This document was generated by GuardSport and may be used as evidence of copyright infringement.</p>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="guardsport_evidence_${asset_id}.html"`,
    }
  })
}
