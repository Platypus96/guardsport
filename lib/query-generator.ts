/**
 * Generates an array of search query variations to catch different piracy formats.
 */
export function generateSearchQueries(title: string): string[] {
  if (!title) return []

  // Clean the title for the base query
  const cleanTitle = title.trim()
  
  const queries = [
    // 1. Exact match (wrapped in quotes for strictness)
    `"${cleanTitle}"`,
    
    // 2. Loose match + "free stream"
    `${cleanTitle} free stream`,
    
    // 3. Loose match + "watch online"
    `${cleanTitle} watch online`,
    
    // 4. Loose match + "download"
    `${cleanTitle} download full`,
    
    // 5. Social media specific
    `${cleanTitle} (site:twitter.com OR site:x.com OR site:reddit.com OR site:t.me OR site:facebook.com)`
  ]

  return queries
}
