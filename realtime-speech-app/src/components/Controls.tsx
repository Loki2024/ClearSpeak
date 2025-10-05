import { useEffect } from 'react'
import { useApp } from '../store'
import {
  initAudio,
  startRecording,
  stopRecording,
  speak,
  startEnvListening,
  stopEnvListening,
} from '../audio/pipeline'
import NoiseMeter from './NoiseMeter'
import QuickPhrases from './QuickPhrases'

export default function Controls() {
  const s = useApp()
  useEffect(() => { initAudio() }, [])
  const canStopEnv = s.envListening && s.envMinCountdown <= 0

  return (
    <div className="card">
      <div style={{ display: 'grid', gap: 18 }}>
        {/* ENVIRONMENT LISTENING */}
        <section>
          <h3>Environment Calibration</h3>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {!s.envListening ? (
              <button className="button-primary" onClick={startEnvListening}>
                Listen to Background
              </button>
            ) : (
              <button
                onClick={stopEnvListening}
                disabled={!canStopEnv}
                className="button-primary"
                style={{ opacity: canStopEnv ? 1 : 0.7 }}
              >
                Stop Listening
              </button>
            )}

            <span className="pill">Countdown: {Math.max(0, Math.ceil(s.envMinCountdown))}s</span>
            <span className="pill">Elapsed: {s.envElapsedSec.toFixed(1)}s</span>

            {s.envAvgNoise > 0 && (
              <span className="pill">
                Avg noise: {Math.round(s.envAvgNoise)} dBA • Suggested volume:{' '}
                {Math.round((s.suggestedVolume ?? s.volume) * 100)}%
              </span>
            )}
          </div>

          <NoiseMeter />
        </section>

        <hr />

        {/* VOICE CONTROLS */}
        <section>
          <h3>Voice & Clarity</h3>

          <div className="row">
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
              {(s.volume).toFixed(2)}
              {s.suggestedVolume !== null ? ` (suggested ${Math.round(s.suggestedVolume * 100)}%)` : ''}
            </span>
          </div>

          <div className="row">
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

          <div className="row">
            <label style={{ minWidth: 80, opacity: 0.85 }}>Rate</label>
            <input
              className="slider"
              type="range"
              min={0.5}
              max={2}
              step={0.05}
              value={s.rate}
              onChange={(e) => s.setRate(+e.target.value)}
            />
            <span className="small">{s.rate.toFixed(2)}</span>
          </div>

          <div className="row">
            <label style={{ minWidth: 80, opacity: 0.85 }}>Pitch</label>
            <input
              className="slider"
              type="range"
              min={0.5}
              max={2}
              step={0.05}
              value={s.pitch}
              onChange={(e) => s.setPitch(+e.target.value)}
            />
            <span className="small">{s.pitch.toFixed(2)}</span>
          </div>

          {/* LANGUAGE SELECTION */}
          <div className="lang-selects">
            <div className="lang-card">
              <h4 className="lang-title">🎙 Input Language</h4>
              <select
                value={s.inputLang}
                onChange={(e) => s.setLangs(e.target.value, s.outputLang)}
                className="lang-select"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Español (ES)</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
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
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Español (ES)</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
              </select>
            </div>
          </div>

          {/* RECOGNITION CONTROLS */}
          <div style={{ marginTop: 16 }}>
            <div className="row" style={{ marginBottom: 10 }}>
              {!s.running ? (
                <button onClick={startRecording} className="button-primary">
                  Start Recognition
                </button>
              ) : (
                <button onClick={stopRecording} className="button-danger">
                  Stop Recognition
                </button>
              )}
              <button onClick={() => speak(s.asrText || 'Hello, testing voice.')}>
                Speak last text
              </button>
            </div>

            {s.asrText && (
              <div
                style={{
                  marginTop: 6,
                  background: 'linear-gradient(180deg,#101826,#0b1320)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  fontSize: '.95rem',
                  color: '#dce6f4',
                  fontStyle: 'italic',
                  maxHeight: 120,
                  overflowY: 'auto',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,.25)',
                }}
              >
                “{s.asrText}”
              </div>
            )}
          </div>
        </section>

        <QuickPhrases />
      </div>
    </div>
  )
}
