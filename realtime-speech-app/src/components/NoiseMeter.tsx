import { useApp } from '../store'

export default function NoiseMeter() {
  const n = useApp(s => s.noise)

  const color = n < 45 ? '#4caf50' : n < 70 ? '#ffeb3b' : '#f44336'

  return (
    <div style={{ marginTop: 8 }}>
      <div className="meter" style={{ background: '#14202c', borderRadius: 10, overflow: 'hidden', border: '1px solid #223246' }}>
        <div style={{ width: `${n}%`, background: color, height: 14, transition: 'width .1s linear, background .25s ease' }} />
      </div>
      <small style={{ color, display: 'inline-block', marginTop: 6 }}>
        Ambient Level: {Math.round(n)} dBA
      </small>
    </div>
  )
}
