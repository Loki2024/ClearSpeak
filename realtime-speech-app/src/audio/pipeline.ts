// Type shim for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}
export {}

import { useApp } from '../store'

let ctx: AudioContext | null = null
let analyser: AnalyserNode | null = null
let micSource: MediaStreamAudioSourceNode | null = null
let meterLoopId = 0

// Separate buffers for environment listening
let envLoopId = 0
let envSamples: number[] = []

/** Initialize mic + analyser (no processing) */
export async function initAudio() {
  if (ctx) return
  ctx = new AudioContext()
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      channelCount: 1,
      sampleRate: 48000,
    }
  })
  micSource = ctx.createMediaStreamSource(stream)
  analyser = ctx.createAnalyser()
  analyser.fftSize = 1024
  micSource.connect(analyser)
  await ctx.resume()
  startMeter() // general meter (kept running)
  console.log('🎤 Audio initialized')
}

/** General noise meter loop (for non-env listening UI too) */
function startMeter() {
  if (!analyser) return
  cancelAnimationFrame(meterLoopId)
  const data = new Uint8Array(1024)
  const { setNoise } = useApp.getState()

  const loop = () => {
    if (!analyser) return
    analyser.getByteTimeDomainData(data)

    // RMS
    let sum = 0
    for (const x of data) {
      const v = (x - 128) / 128
      sum += v * v
    }
    const rms = Math.sqrt(sum / data.length)
    const dBA = Math.max(20, Math.min(100, 20 * Math.log10(rms + 1e-4) + 90))

    setNoise(dBA)
    meterLoopId = requestAnimationFrame(loop)
  }
  loop()
}

/** Map ambient dBA to suggested TTS volume (0..1) */
export function volumeFromNoise(noiseDBA: number) {
  if (noiseDBA <= 25) return 0.40
  if (noiseDBA <= 45) return 0.40 + (noiseDBA - 25) * (0.20 / 20)
  if (noiseDBA <= 65) return 0.60 + (noiseDBA - 45) * (0.20 / 20)
  return Math.min(1.0, 0.80 + (noiseDBA - 65) * (0.20 / 20))
}

/** Start environment listening (indefinite) with 5s minimum */
export async function startEnvListening() {
  if (!ctx || !analyser) await initAudio()
  const s = useApp.getState()
  if (s.envListening) return

  useApp.getState().startEnvSession()
  envSamples = []
  cancelAnimationFrame(envLoopId)

  const data = new Uint8Array(1024)
  const start = performance.now()

  const loop = () => {
    if (!analyser) return
    analyser.getByteTimeDomainData(data)

    // sample → dBA-like value
    let sum = 0
    for (const x of data) {
      const v = (x - 128) / 128
      sum += v * v
    }
    const rms = Math.sqrt(sum / data.length)
    const dBA = Math.max(20, Math.min(100, 20 * Math.log10(rms + 1e-4) + 90))

    envSamples.push(dBA)

    const elapsedSec = (performance.now() - start) / 1000
    const minCountdown = Math.max(0, 5 - elapsedSec)
    useApp.getState().updateEnvProgress(elapsedSec, minCountdown)

    envLoopId = requestAnimationFrame(loop)
  }
  loop()
}

/** Stop environment listening; requires 5s minimum (UI enforces) */
export function stopEnvListening() {
  cancelAnimationFrame(envLoopId)
  const s = useApp.getState()

  const avg =
    envSamples.length > 0
      ? envSamples.reduce((a, b) => a + b, 0) / envSamples.length
      : 0

  s.stopEnvSession(avg)

  // compute suggestion & apply
  const suggested = volumeFromNoise(avg || 20)
  s.setSuggestedVolume(suggested)
  s.setVolume(suggested)

  console.log(`✅ Env avg: ${avg.toFixed(1)} dBA → suggested volume ${Math.round(suggested*100)}%`)
}

/** TTS output */
export function speak(text: string) {
  const s = useApp.getState()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = s.outputLang
  u.rate = s.rate
  u.pitch = s.pitch
  u.volume = s.volume
  window.speechSynthesis.speak(u)
}

/** ASR start/stop */
let recognition: any | null = null

export function startRecording() {
  const { inputLang, setASR, toggleRun, setMode } = useApp.getState()
  const Rec = window.webkitSpeechRecognition || window.SpeechRecognition
  if (!Rec) {
    alert('SpeechRecognition not supported')
    return
  }

  recognition = new Rec()
  recognition.lang = inputLang
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onstart = () => setMode('asr')
  recognition.onend = () => useApp.getState().setMode('idle')

  recognition.onresult = (e: any) => {
    let txt = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      txt += e.results[i][0].transcript + ' '
    }
    setASR(txt.trim())
  }

  recognition.start()
  toggleRun()
  console.log('🎙️ Recognition started')
}

export function stopRecording() {
  const { running, toggleRun } = useApp.getState()
  if (recognition) {
    recognition.onend = null
    recognition.stop()
    recognition = null
  }
  useApp.getState().setMode('idle')
  if (running) toggleRun()
  console.log('🛑 Recognition stopped')
}
