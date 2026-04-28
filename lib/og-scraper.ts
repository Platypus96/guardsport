/**
 * Lightweight, zero-dependency Open Graph (OG) metadata scraper.
 * Uses native fetch and regex to extract meta tags without loading a full DOM parser.
 */

export interface OGMetadata {
  ogTitle: string | null
  ogType: string | null
  ogSiteName: string | null
  ogVideo: string | null
  hasVideoContent: boolean
}

export async function fetchOGMetadata(url: string): Promise<OGMetadata> {
  const defaultMeta: OGMetadata = {
    ogTitle: null,
    ogType: null,
    ogSiteName: null,
    ogVideo: null,
    hasVideoContent: false
  }

  try {
    // 5-second timeout to prevent stalling on slow sites
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GuardSportBot/1.0 (Mozilla/5.0 compatible)',
        'Accept': 'text/html'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) return defaultMeta

    // Read only the first 50KB to grab the <head> section fast
    const reader = response.body?.getReader()
    if (!reader) return defaultMeta

    let html = ''
    let bytesRead = 0
    const maxBytes = 50 * 1024 // 50KB

    while (bytesRead < maxBytes) {
      const { done, value } = await reader.read()
      if (done) break
      html += new TextDecoder('utf-8').decode(value)
      bytesRead += value.length
      
      // If we've passed the closing head tag, stop reading
      if (html.includes('</head>')) break
    }
    
    // Cleanup stream
    reader.cancel()

    // Regex extractors
    const extractContent = (property: string) => {
      // Matches <meta property="og:title" content="The Title" /> or <meta content="The Title" property="og:title" />
      const regex = new RegExp(`<meta[^>]*?(?:property|name)=["']${property}["'][^>]*?content=["']([^"']*)["']`, 'i')
      const regexReverse = new RegExp(`<meta[^>]*?content=["']([^"']*)["'][^>]*?(?:property|name)=["']${property}["']`, 'i')
      
      const match = html.match(regex) || html.match(regexReverse)
      return match ? match[1] : null
    }

    const ogTitle = extractContent('og:title') || extractContent('twitter:title') || html.match(/<title>([^<]*)<\/title>/i)?.[1] || null
    const ogType = extractContent('og:type')
    const ogSiteName = extractContent('og:site_name')
    const ogVideo = extractContent('og:video') || extractContent('og:video:url') || extractContent('twitter:player')

    // Determine if this is actually a video
    // 1. OG Type is explicitly video
    // 2. URL is a known video platform (YouTube, TikTok, etc.)
    // 3. Page has video OG tags
    const isKnownVideoPlatform = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('tiktok.com') || url.includes('vimeo.com')
    
    const hasVideoContent = 
      (ogType && ogType.includes('video')) || 
      !!ogVideo || 
      isKnownVideoPlatform

    return {
      ogTitle,
      ogType,
      ogSiteName,
      ogVideo,
      hasVideoContent
    }

  } catch (error) {
    // Silently fail on network errors, timeouts, or CORS issues
    return defaultMeta
  }
}
