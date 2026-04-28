/**
 * GuardSport Client-Side Watermark Engine
 * 
 * Applies a visible text watermark to video frames using the browser's
 * <canvas> + MediaRecorder APIs. The original video never leaves the device.
 * 
 * Outputs a watermarked .webm file for safe public sharing.
 */

export interface WatermarkConfig {
  text: string
  fontSize?: number
  fontFamily?: string
  color?: string
  opacity?: number
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
  /** Include a timestamp watermark */
  includeTimestamp?: boolean
}

const DEFAULT_CONFIG: Required<WatermarkConfig> = {
  text: '© GuardSport',
  fontSize: 20,
  fontFamily: 'Inter, sans-serif',
  color: 'white',
  opacity: 0.35,
  position: 'bottom-right',
  includeTimestamp: true,
}

/**
 * Generate a watermarked copy of a video file entirely in the browser.
 * 
 * @param file - The original video file
 * @param config - Watermark configuration  
 * @param onProgress - Progress callback (0-100)
 * @returns Blob of the watermarked video (.webm)
 */
export async function applyWatermark(
  file: File,
  config: WatermarkConfig,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    video.preload = 'auto'
    video.muted = true
    video.playsInline = true

    const url = URL.createObjectURL(file)
    video.src = url

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Set up MediaRecorder to capture the canvas as video
      const stream = canvas.captureStream(30) // 30 FPS
      
      // Check for supported MIME types
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm'

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5_000_000, // 5 Mbps
      })

      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      recorder.onstop = () => {
        URL.revokeObjectURL(url)
        const blob = new Blob(chunks, { type: 'video/webm' })
        resolve(blob)
      }

      recorder.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('MediaRecorder error during watermarking'))
      }

      // Drawing loop
      function drawFrame() {
        if (video.paused || video.ended) {
          recorder.stop()
          return
        }

        // Draw original frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Apply watermark overlay
        ctx.save()
        ctx.globalAlpha = cfg.opacity
        ctx.font = `bold ${cfg.fontSize}px ${cfg.fontFamily}`
        ctx.fillStyle = cfg.color
        ctx.shadowColor = 'rgba(0,0,0,0.7)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1

        const text = cfg.includeTimestamp
          ? `${cfg.text} • ${new Date().toISOString().slice(0, 10)}`
          : cfg.text

        const metrics = ctx.measureText(text)
        const textWidth = metrics.width
        const padding = 16

        let x: number, y: number
        switch (cfg.position) {
          case 'bottom-right':
            x = canvas.width - textWidth - padding
            y = canvas.height - padding
            break
          case 'bottom-left':
            x = padding
            y = canvas.height - padding
            break
          case 'top-right':
            x = canvas.width - textWidth - padding
            y = cfg.fontSize + padding
            break
          case 'top-left':
            x = padding
            y = cfg.fontSize + padding
            break
          case 'center':
            x = (canvas.width - textWidth) / 2
            y = canvas.height / 2
            break
        }

        ctx.fillText(text, x, y)
        ctx.restore()

        // Report progress
        if (video.duration && onProgress) {
          onProgress(Math.round((video.currentTime / video.duration) * 100))
        }

        requestAnimationFrame(drawFrame)
      }

      recorder.start()
      video.play()
      drawFrame()
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load video for watermarking'))
    }
  })
}

/**
 * Trigger a download of the watermarked video blob.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
