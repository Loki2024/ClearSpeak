// ✅ Fix missing Web Speech API types for TypeScript
declare global {
  interface Window {
    webkitSpeechRecognition: any
  }
}

// Allow using SpeechRecognition without type errors
type SpeechRecognition = any

import { useApp } from "../store"

let recognition: SpeechRecognition | null = null

export function startRecognition() {
  const s = useApp.getState()

  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech recognition is not supported in this browser.")
    return
  }

  const SpeechRecognition = (window as any).webkitSpeechRecognition
  recognition = new SpeechRecognition()
  recognition.lang = s.inputLang
  recognition.continuous = true // ✅ Keeps listening even after short pauses
  recognition.interimResults = true

  // 🧹 Reset transcript at start of new recording
  s.setASR("")
  let fullTranscript = ""
  let lastResultTime = Date.now()

  recognition.onresult = (event: any) => {
    const now = Date.now()
    let interim = ""

    // ⏸ Add pause marker if user stops talking for >1.5 seconds
    if (now - lastResultTime > 1500 && fullTranscript.trim() !== "") {
      fullTranscript += " | "
    }
    lastResultTime = now

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i]
      if (result.isFinal) {
        fullTranscript += " " + result[0].transcript.trim()
      } else {
        interim += result[0].transcript
      }
    }

    // ✅ Update live transcript with pauses preserved
    s.setASR((fullTranscript + " " + interim).trim())
  }

  recognition.onerror = (e: any) => {
    console.error("Recognition error:", e)
  }

  recognition.onend = () => {
    // Recognition naturally stops after inactivity
    s.setMode("idle")
  }

  recognition.start()
  s.toggleRun()
  s.setMode("asr")
}

export function stopRecognition() {
  const s = useApp.getState()
  if (recognition) {
    recognition.stop()
    recognition = null
  }
  s.toggleRun()
  s.setMode("idle")
}
