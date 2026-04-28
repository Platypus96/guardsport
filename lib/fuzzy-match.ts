/**
 * Normalizes a string by converting to lowercase, removing special characters,
 * and stripping out common "noise" words used in piracy.
 */
export function normalizeTitle(title: string): string {
  if (!title) return ''
  
  const noiseWords = ['hd', 'full', 'free', 'watch', 'online', 'download', 'stream', 'live', 'highlights', 'official']
  
  // Lowercase and remove punctuation
  let normalized = title.toLowerCase().replace(/[^\w\s]/g, ' ')
  
  // Remove noise words
  const words = normalized.split(/\s+/).filter(w => w.length > 0)
  const filtered = words.filter(w => !noiseWords.includes(w))
  
  return filtered.join(' ')
}

/**
 * Calculates the Jaccard-style token overlap between two strings.
 * Returns a percentage (0.0 to 1.0) of original tokens found in the target.
 */
export function tokenOverlap(original: string, found: string): number {
  const normOriginal = normalizeTitle(original)
  const normFound = normalizeTitle(found)
  
  if (!normOriginal || !normFound) return 0
  
  const tokensOrig = new Set(normOriginal.split(' '))
  const tokensFound = new Set(normFound.split(' '))
  
  let matchCount = 0
  tokensOrig.forEach(token => {
    if (tokensFound.has(token)) matchCount++
  })
  
  return matchCount / tokensOrig.size
}

/**
 * Calculates the Levenshtein distance between two strings.
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix = []
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

/**
 * Converts Levenshtein distance to a similarity score (0.0 to 1.0).
 */
export function levenshteinSimilarity(a: string, b: string): number {
  const normA = normalizeTitle(a)
  const normB = normalizeTitle(b)
  
  if (!normA || !normB) return 0
  if (normA === normB) return 1
  
  const maxLength = Math.max(normA.length, normB.length)
  const distance = levenshteinDistance(normA, normB)
  
  return (maxLength - distance) / maxLength
}

/**
 * Calculates a proprietary Confidence Score (0-100) for a potential violation.
 * Factors in token overlap, character similarity, and video content verification.
 */
export function calculateConfidence(originalTitle: string, foundTitle: string | null, hasVideo: boolean): number {
  if (!foundTitle) return hasVideo ? 50 : 0
  
  const overlap = tokenOverlap(originalTitle, foundTitle)
  const similarity = levenshteinSimilarity(originalTitle, foundTitle)
  
  // Base score heavily weighted toward token overlap (pirates often append words, messing up strict Levenshtein)
  let score = (overlap * 60) + (similarity * 40)
  
  // Video verification bonus/penalty
  if (hasVideo) {
    score += 15 // Strong indicator
  } else {
    score -= 20 // If we couldn't verify it's a video, lower confidence
  }
  
  // Cap between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)))
}
