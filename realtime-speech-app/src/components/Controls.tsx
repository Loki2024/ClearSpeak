import { useEffect } from "react"
import { useApp } from "../store"
import {
  initAudio,
  startRecording,
  stopRecording,
  speak,
  startEnvListening,
  stopEnvListening,
} from "../audio/pipeline"
import { startRecognition, stopRecognition } from "../audio/recognition"
import NoiseMeter from "./NoiseMeter"
import QuickPhrases from "./QuickPhrases"

export default function Controls() {
  const s = useApp()

  useEffect(() => {
    initAudio()
  }, [])

  const canStopEnv = s.envListening && s.envMinCountdown <= 0

  // ✅ Auto stop recognition and play output
  const handleStopAndSpeak = async () => {
    await stopRecognition()

    // Auto volume adjust if envAvgNoise is high or low
    if (s.envAvgNoise > 0) {
      const suggested = Math.min(1, Math.max(0.2, s.envAvgNoise / 100))
      s.setSuggestedVolume(suggested)
      s.setVolume(suggested)
    }

    // Wait before speaking to ensure final transcript captured
    setTimeout(() => {
      if (s.asrText.trim()) {
        s.setMode("speaking")
        speak(s.asrText)
      }
    }, 600)
  }

  return (
    <div className="card" style={{ padding: "30px 36px", borderRadius: 22 }}>
      <div style={{ display: "grid", gap: 30 }}>
        {/* 🌐 ENVIRONMENT LISTENING */}
        <section>
          <h2
            style={{
              fontSize: "1.3rem",
              marginBottom: 16,
              background: "linear-gradient(90deg,#7cc6ff,#5bb1ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🎚 Environment Calibration
          </h2>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            {!s.envListening ? (
              <button
                className="button-primary"
                onClick={startEnvListening}
                style={{ padding: "10px 16px", fontWeight: 600 }}
              >
                🎧 Listen to Background
              </button>
            ) : (
              <button
                onClick={stopEnvListening}
                disabled={!canStopEnv}
                className="button-primary"
                style={{
                  opacity: canStopEnv ? 1 : 0.6,
                  padding: "10px 16px",
                  fontWeight: 600,
                }}
              >
                🛑 Stop Listening
              </button>
            )}

            <span className="pill">
              Countdown: {Math.max(0, Math.ceil(s.envMinCountdown))}s
            </span>
            <span className="pill">Elapsed: {s.envElapsedSec.toFixed(1)}s</span>

            {s.envAvgNoise > 0 && (
              <span className="pill">
                Avg noise: {Math.round(s.envAvgNoise)} dBA • Suggested volume:{" "}
                {Math.round((s.suggestedVolume ?? s.volume) * 100)}%
              </span>
            )}
          </div>

          <NoiseMeter />
        </section>

        <hr style={{ borderColor: "#1b2a3b" }} />

        {/* 🎤 SPEECH RECOGNITION */}
        <section>
          <h2
            style={{
              fontSize: "1.3rem",
              marginBottom: 16,
              background: "linear-gradient(90deg,#66bb6a,#a6e7a6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🗣 Speech Recognition
          </h2>

          <div
            className="row"
            style={{
              justifyContent: "center",
              marginBottom: 12,
              gap: 12,
            }}
          >
            {!s.running ? (
              <button
                onClick={startRecognition}
                className="button-primary"
                style={{
                  fontSize: "1.05rem",
                  padding: "12px 22px",
                  borderRadius: 14,
                  background: "linear-gradient(180deg,#234263,#1a2f48)",
                  boxShadow: "0 0 15px rgba(91,177,255,.25)",
                }}
              >
                🎙 Start Recording
              </button>
            ) : (
              <button
                onClick={handleStopAndSpeak}
                className="button-danger"
                style={{
                  fontSize: "1.05rem",
                  padding: "12px 22px",
                  borderRadius: 14,
                  background: "linear-gradient(180deg,#4a2025,#2a1518)",
                  boxShadow: "0 0 15px rgba(255,90,90,.3)",
                }}
              >
                ⏹ Stop Recording
              </button>
            )}
          </div>

          <div
            style={{
              background: "linear-gradient(180deg,#101826,#0b1320)",
              borderRadius: 14,
              border: "1px solid var(--border)",
              padding: "16px 20px",
              boxShadow: "inset 0 0 18px rgba(0,0,0,.45)",
            }}
          >
            <h4
              style={{
                margin: "0 0 10px",
                fontWeight: 600,
                color: "#9bcfff",
                textTransform: "uppercase",
                fontSize: ".88rem",
              }}
            >
              Live Transcript
            </h4>

            <textarea
              value={s.asrText}
              readOnly
              rows={4}
              style={{
                width: "100%",
                resize: "none",
                borderRadius: "10px",
                background: "linear-gradient(180deg,#0e1622,#0b1018)",
                color: "#dfe7f3",
                padding: "12px 14px",
                border: "1px solid var(--border)",
                fontFamily: "monospace",
                fontSize: "0.95rem",
                boxShadow: "inset 0 0 12px rgba(0,0,0,.4)",
              }}
            />
          </div>
        </section>

        <hr style={{ borderColor: "#1b2a3b" }} />

        {/* 🎛 VOICE SETTINGS */}
        <section>
          <h2
            style={{
              fontSize: "1.3rem",
              marginBottom: 16,
              background: "linear-gradient(90deg,#80c9ff,#a6d4ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🎵 Voice Settings
          </h2>

          <div className="row" style={{ marginBottom: 12 }}>
            <label style={{ minWidth: 80, opacity: 0.85 }}>Volume</label>
            <input
              className="slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={s.volume}
              onChange={(e) => s.setVolume(+e.target.value)}
            />
            <span className="small">
              {(s.volume).toFixed(2)}{" "}
              {s.suggestedVolume !== null
                ? `(suggested ${Math.round(s.suggestedVolume * 100)}%)`
                : ""}
            </span>
          </div>

          {/* 🧠 Clarity slider */}
          <div className="row" style={{ marginBottom: 12 }}>
            <label style={{ minWidth: 80, opacity: 0.85 }}>Clarity</label>
            <input
              className="slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={s.clarity}
              onChange={(e) => s.setClarity(+e.target.value)}
            />
            <span className="small">{s.clarity.toFixed(2)}</span>
          </div>

          {/* 🌍 LANGUAGES */}
          <div className="lang-selects" style={{ marginTop: 18 }}>
            <div className="lang-card">
              <h4 className="lang-title">🎙 Input Language</h4>
              <select
                value={s.inputLang}
                onChange={(e) => s.setLangs(e.target.value, s.outputLang)}
                className="lang-select"
              >
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
                <option value="it-IT">Italiano</option>
                <option value="hi-IN">हिन्दी</option>
                <option value="ja-JP">日本語</option>
                <option value="zh-CN">中文</option>
              </select>
            </div>

            <div className="lang-card">
              <h4 className="lang-title">🔊 Output Language</h4>
              <select
                value={s.outputLang}
                onChange={(e) => s.setLangs(s.inputLang, e.target.value)}
                className="lang-select"
              >
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
                <option value="it-IT">Italiano</option>
                <option value="hi-IN">हिन्दी</option>
                <option value="ja-JP">日本語</option>
                <option value="zh-CN">中文</option>
              </select>
            </div>
          </div>
        </section>

        <QuickPhrases />
      </div>
    </div>
  )
}
