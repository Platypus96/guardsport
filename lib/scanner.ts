import { generateSearchQueries } from './query-generator'
import { fetchOGMetadata } from './og-scraper'
import { calculateConfidence } from './fuzzy-match'

export interface ScanResult {
  found_url: string
  platform: string
  og_title: string | null
  has_video: boolean
  confidence: number
}

export async function scanForViolations(assetTitle: string, assetUrl: string): Promise<ScanResult[]> {
  console.log(`[GuardSport Intelligence Engine] Scanning for: "${assetTitle}"`)

  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) {
    console.error('SERPER_API_KEY is not set')
    return []
  }

  const queries = generateSearchQueries(assetTitle)
  const allResults = new Map<string, any>()

  // Layer 1: Discovery (Serper)
  // We run multiple search variants concurrently to cast a wide net
  console.log(`[Layer 1] Running ${queries.length} search variations...`)
  
  await Promise.all(queries.map(async (query) => {
    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: query, num: 10 })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.organic) {
          data.organic.forEach((item: any) => {
            // Deduplicate by URL
            if (!allResults.has(item.link)) {
              allResults.set(item.link, item)
            }
          })
        }
      }
    } catch (err) {
      console.error(`Serper query failed: ${query}`)
    }
  }))

  const cleanAssetUrl = assetUrl.replace(/^https?:\/\/(www\.)?/, '')
  const finalViolations: ScanResult[] = []

  console.log(`[Layer 2 & 3] Verifying and Scoring ${allResults.size} unique candidate URLs...`)

  // We process candidates concurrently in small batches to avoid memory/network spikes,
  // but for simplicity here we use Promise.all for the fetch calls.
  await Promise.all(Array.from(allResults.values()).map(async (item) => {
    const url = item.link
    
    // Skip if this result IS the actual official asset
    if (url.includes(cleanAssetUrl)) return

    // Identify Platform
    let platform = 'Other Web'
    if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'YouTube'
    else if (url.includes('twitter.com') || url.includes('x.com')) platform = 'Twitter'
    else if (url.includes('reddit.com')) platform = 'Reddit'
    else if (url.includes('t.me')) platform = 'Telegram'
    else if (url.includes('facebook.com') || url.includes('fb.watch')) platform = 'Facebook'
    else if (url.includes('tiktok.com')) platform = 'TikTok'

    // Layer 2: Verification (Fetch OG tags)
    const ogMeta = await fetchOGMetadata(url)

    // Layer 3: Scoring (Fuzzy Match + Confidence)
    // If OG Title is missing, fallback to the title Google scraped
    const targetTitle = ogMeta.ogTitle || item.title
    
    const confidence = calculateConfidence(assetTitle, targetTitle, ogMeta.hasVideoContent)

    // Filter out low confidence matches (below 50%)
    if (confidence >= 50) {
      finalViolations.push({
        found_url: url,
        platform,
        og_title: targetTitle,
        has_video: ogMeta.hasVideoContent,
        confidence
      })
    }
  }))

  // Sort by highest threat (confidence) first
  finalViolations.sort((a, b) => b.confidence - a.confidence)

  console.log(`[GuardSport] Scan complete. Found ${finalViolations.length} actionable threats.`)
  return finalViolations
}
