import { useEffect, useState } from 'react'
import { useApp } from '../store'
import {
  initAudio,
  startRecording,
  stopRecording,
  speak,
  startEnvListening,
  stopEnvListening,
  recordAndPlayEnhanced,
  volumeFromNoise
} from '../audio/pipeline'
import NoiseMeter from './NoiseMeter'

export default function Controls() {
  const s = useApp()
  const [calibrating, setCalibrating] = useState(false)

  useEffect(() => { initAudio() }, [])

  const handleCalibrate = async () => {
    if (calibrating) return
    setCalibrating(true)
    const avg = await startEnvListening(5)
    stopEnvListening()

    const suggested = volumeFromNoise(avg)
    s.setEnvAvgNoise(avg)
    s.setSuggestedVolume(suggested)
    s.setVolume(suggested)

    setCalibrating(false)
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Environment Calibration</h3>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={handleCalibrate} disabled={calibrating}>
          {calibrating ? 'Listening 5s…' : 'Listen to Background (5s)'}
        </button>
        {s.envAvgNoise > 0 && (
          <span className="pill">
            Avg noise: {Math.round(s.envAvgNoise)} dBA • Suggested volume: {Math.round((s.suggestedVolume ?? s.volume) * 100)}%
          </span>
        )}
      </div>

      {/* Live meter always visible */}
      <NoiseMeter />

      <hr style={{ border: 'none', borderTop: '1px solid #1b2a3b', margin: '18px 0' }} />

      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Voice Controls</h3>

      <div className="row">
        <label style={{ minWidth: 80, opacity: .85 }}>Volume</label>
        <input
          className="slider"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={s.volume}
          onChange={(e) => s.setVolume(+e.target.value)}
        />
        <span className="small">{(s.volume).toFixed(2)}{s.suggestedVolume !== null ? ` (suggested ${Math.round(s.suggestedVolume * 100)}%)` : ''}</span>
      </div>

      <div className="row">
        <label style={{ minWidth: 80, opacity: .85 }}>Rate</label>
        <input className="slider" type="range" min={0.5} max={2} step={0.05} value={s.rate} onChange={e => s.setRate(+e.target.value)} />
        <span className="small">{s.rate.toFixed(2)}</span>
      </div>

      <div className="row">
        <label style={{ minWidth: 80, opacity: .85 }}>Pitch</label>
        <input className="slider" type="range" min={0.5} max={2} step={0.05} value={s.pitch} onChange={e => s.setPitch(+e.target.value)} />
        <span className="small">{s.pitch.toFixed(2)}</span>
      </div>

      <div className="row">
        <label style={{ minWidth: 80, opacity: .85 }}>Input</label>
        <select value={s.inputLang} onChange={e => s.setLangs(e.target.value, s.outputLang)}>
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
          <option value="es-ES">Español (ES)</option>
        </select>
        <label style={{ minWidth: 80, opacity: .85 }}>Output</label>
        <select value={s.outputLang} onChange={e => s.setLangs(s.inputLang, e.target.value)}>
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
          <option value="es-ES">Español (ES)</option>
        </select>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        {!s.running ? (
          <button onClick={startRecording}>Start Recognition</button>
        ) : (
          <button onClick={stopRecording} style={{ background: '#ff4d4d33' }}>Stop Recognition</button>
        )}
        <button onClick={() => speak(s.asrText || 'Hello, testing voice.')} >Speak last text</button>
        <button onClick={() => recordAndPlayEnhanced(5)}>Record & Play Enhanced (5s)</button>
      </div>
    </div>
  )
}
