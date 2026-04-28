export async function scanForViolations(assetTitle: string): Promise<{
  found_url: string
  platform: string
}[]> {
  // MVP: simulated scan. Replace with real Playwright crawler in v2.
  console.log(`Scanning for violations of: "${assetTitle}"`)

  const platforms = ['YouTube', 'Twitter', 'Telegram', 'Facebook', 'Reddit']
  const results = []

  const count = Math.floor(Math.random() * 4) // 0-3 violations
  for (let i = 0; i < count; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)]
    results.push({
      found_url: `https://${platform.toLowerCase()}.com/watch?v=piracy_${Math.random().toString(36).slice(2, 8)}`,
      platform,
    })
  }

  return results
}
