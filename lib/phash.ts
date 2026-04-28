/**
 * GuardSport Perceptual Hash (pHash) Engine
 * 
 * Pure client-side implementation using DCT-based perceptual hashing.
 * This is the same algorithmic foundation used by YouTube Content ID.
 * 
 * The video NEVER leaves the user's browser. Only the tiny hash strings
 * (64-bit hex values) are sent to the server.
 */

// ─── DCT (Discrete Cosine Transform) ───────────────────────────────

/**
 * Compute 2D DCT-II on an NxN matrix (Type-II, orthogonal).
 * Used to convert spatial pixel data into frequency-domain coefficients.
 */
function dct2d(matrix: number[][], N: number): number[][] {
  const result: number[][] = Array.from({ length: N }, () => new Array(N).fill(0))
  const c = (k: number) => (k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N))

  for (let u = 0; u < N; u++) {
    for (let v = 0; v < N; v++) {
      let sum = 0
      for (let x = 0; x < N; x++) {
        for (let y = 0; y < N; y++) {
          sum +=
            matrix[x][y] *
            Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N)) *
            Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N))
        }
      }
      result[u][v] = c(u) * c(v) * sum
    }
  }
  return result
}

// ─── Frame Extraction ───────────────────────────────────────────────

/**
 * Extracts key frames from a video file using the browser's native
 * <video> and <canvas> APIs. No server upload required.
 * 
 * @param file - The video File object from the user's input
 * @param frameCount - Number of frames to extract (default: 10)
 * @param onProgress - Optional callback for progress updates
 * @returns Array of ImageData objects (one per extracted frame)
 */
export async function extractFrames(
  file: File,
  frameCount: number = 10,
  onProgress?: (current: number, total: number) => void
): Promise<ImageData[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    video.preload = 'auto'
    video.muted = true
    video.playsInline = true

    const url = URL.createObjectURL(file)
    video.src = url

    const frames: ImageData[] = []

    video.onloadedmetadata = () => {
      const duration = video.duration
      if (duration === 0 || !isFinite(duration)) {
        URL.revokeObjectURL(url)
        reject(new Error('Could not read video duration'))
        return
      }

      // Sample evenly across the video (skip first and last 5%)
      const startOffset = duration * 0.05
      const endOffset = duration * 0.95
      const interval = (endOffset - startOffset) / frameCount

      canvas.width = 32
      canvas.height = 32

      let currentFrame = 0

      function captureFrame() {
        if (currentFrame >= frameCount) {
          URL.revokeObjectURL(url)
          resolve(frames)
          return
        }

        const seekTime = startOffset + currentFrame * interval
        video.currentTime = Math.min(seekTime, duration - 0.1)
      }

      video.onseeked = () => {
        // Draw the current frame scaled down to 32x32
        ctx.drawImage(video, 0, 0, 32, 32)
        const imageData = ctx.getImageData(0, 0, 32, 32)
        frames.push(imageData)
        currentFrame++
        onProgress?.(currentFrame, frameCount)
        captureFrame()
      }

      video.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Video playback error during frame extraction'))
      }

      captureFrame()
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load video file'))
    }
  })
}

// ─── Perceptual Hash Generation ─────────────────────────────────────

/**
 * Convert an ImageData (32x32 RGBA) to a grayscale 2D matrix.
 */
function imageDataToGrayscale(imageData: ImageData): number[][] {
  const { data, width, height } = imageData
  const matrix: number[][] = []

  for (let y = 0; y < height; y++) {
    const row: number[] = []
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      // ITU-R BT.601 luma coefficients
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      row.push(gray)
    }
    matrix.push(row)
  }
  return matrix
}

/**
 * Generate a 64-bit perceptual hash from a 32x32 ImageData.
 * 
 * Algorithm:
 * 1. Convert to grayscale
 * 2. Apply 2D DCT
 * 3. Take top-left 8x8 block of DCT coefficients (low frequencies)
 * 4. Compute median of those 64 values
 * 5. Each bit = 1 if coefficient > median, else 0
 * 6. Output as 16-char hex string
 */
export function generatePHash(imageData: ImageData): string {
  const N = 32
  const grayscale = imageDataToGrayscale(imageData)
  const dctResult = dct2d(grayscale, N)

  // Extract top-left 8x8 low-frequency coefficients (skip [0,0] DC component)
  const lowFreq: number[] = []
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      if (u === 0 && v === 0) continue // skip DC
      lowFreq.push(dctResult[u][v])
    }
  }

  // Compute median
  const sorted = [...lowFreq].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]

  // Generate 64-bit hash
  let hash = ''
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      if (u === 0 && v === 0) {
        hash += '0' // DC component always 0
        continue
      }
      hash += dctResult[u][v] > median ? '1' : '0'
    }
  }

  // Convert binary string to hex
  let hex = ''
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(hash.substring(i, i + 4), 2).toString(16)
  }
  return hex
}

// ─── Full Pipeline ──────────────────────────────────────────────────

/**
 * Complete fingerprinting pipeline: extract frames + generate hashes.
 * This runs ENTIRELY in the browser. No video data leaves the device.
 * 
 * @returns Array of { frameIndex, hash } objects
 */
export async function fingerprintVideo(
  file: File,
  frameCount: number = 10,
  onProgress?: (current: number, total: number, stage: string) => void
): Promise<{ frameIndex: number; hash: string }[]> {
  // Stage 1: Extract frames
  onProgress?.(0, frameCount, 'Extracting frames...')
  const frames = await extractFrames(file, frameCount, (cur, tot) => {
    onProgress?.(cur, tot, 'Extracting frames...')
  })

  // Stage 2: Generate hashes
  const fingerprints = frames.map((frame, i) => {
    onProgress?.(i + 1, frames.length, 'Computing fingerprints...')
    return {
      frameIndex: i,
      hash: generatePHash(frame),
    }
  })

  return fingerprints
}

// ─── Hamming Distance (for comparison) ──────────────────────────────

/**
 * Calculate Hamming distance between two perceptual hashes.
 * Lower = more similar.
 * 
 * - distance < 10:  Same content (high confidence match)
 * - distance 10-20: Similar content (medium confidence)
 * - distance > 20:  Different content
 */
export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return 64 // max distance

  let distance = 0
  const a = BigInt(`0x${hash1}`)
  const b = BigInt(`0x${hash2}`)
  let xor = a ^ b

  while (xor > BigInt(0)) {
    distance += Number(xor & BigInt(1))
    xor >>= BigInt(1)
  }
  return distance
}

/**
 * Compare a candidate hash against an array of stored fingerprints.
 * Returns the minimum Hamming distance found (best match).
 */
export function findBestMatch(
  candidateHash: string,
  storedHashes: string[]
): { distance: number; matchIndex: number } {
  let bestDistance = 64
  let bestIndex = -1

  for (let i = 0; i < storedHashes.length; i++) {
    const d = hammingDistance(candidateHash, storedHashes[i])
    if (d < bestDistance) {
      bestDistance = d
      bestIndex = i
    }
  }

  return { distance: bestDistance, matchIndex: bestIndex }
}
