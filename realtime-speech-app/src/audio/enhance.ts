let ctx: AudioContext | null = null
let source: MediaStreamAudioSourceNode | null = null
let recorder: MediaRecorder | null = null
let chunks: BlobPart[] = []

/**
 * Initialize raw audio capture with all browser processing disabled.
 * Connects mic → speakers for live monitoring.
 */
export async function initEnhancer(): Promise<void> {
  if (ctx) return
  ctx = new AudioContext()

  // ✅ Request completely unprocessed microphone input
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      channelCount: 1,
      sampleRate: 48000
    }
  })

  // Create the mic source
  source = ctx.createMediaStreamSource(stream)

  // ✅ Directly monitor mic audio (no effects)
  source.connect(ctx.destination)

  // Optional: verify what the browser actually gave us
  const tracks = stream.getAudioTracks()
  if (tracks.length > 0) {
    const settings = tracks[0].getSettings()
    console.log("🎤 Mic settings:", settings)
  }

  console.log("🎧 Raw audio enhancer initialized — no processing, no gating.")
}

/**
 * Record raw mic audio to a Blob (WebM/Opus)
 */
export async function recordEnhanced(seconds = 5): Promise<Blob> {
  if (!ctx || !source) await initEnhancer()
  if (!ctx || !source) throw new Error("Audio context or source not initialized.")

  // Create a recording destination
  const destination = ctx.createMediaStreamDestination()
  source.connect(destination)

  recorder = new MediaRecorder(destination.stream)
  chunks = []

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data)
  }

  recorder.start()
  console.log("🔴 Recording raw mic audio...")

  return new Promise<Blob>((resolve) => {
    setTimeout(() => {
      if (!recorder) return
      recorder.stop()
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" }) // Opus @ 48kHz
        console.log("✅ Recording complete.")
        resolve(blob)
      }
    }, seconds * 1000)
  })
}

/**
 * Play back the recorded raw audio file
 */
export function playEnhanced(blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.play().catch((err) => console.error("Playback error:", err))
  console.log("▶️ Playing back raw audio.")
}

/**
 * Optional: expose AudioContext
 */
export function getAudioContext(): AudioContext | null {
  return ctx
}
