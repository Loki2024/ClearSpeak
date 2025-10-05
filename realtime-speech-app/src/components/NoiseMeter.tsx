import { useApp } from '../store'

export default function NoiseMeter() {
  const n = useApp(s => s.noise)
  const listening = useApp(s => s.envListening)

  if (!listening) return null

  return (
    <div style={{ marginTop: 10 }}>
      <div className="meter">
        <div
          className="meter-fill"
          style={{
            width: `${n}%`,
            transition: 'width .12s linear, filter .25s ease',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <small className="small">Ambient Level</small>
        <small className="small">{Math.round(n)} dBA</small>
      </div>
    </div>
  )
}
