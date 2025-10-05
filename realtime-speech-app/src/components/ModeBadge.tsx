import { useApp } from '../store'

export default function ModeBadge() {
  const mode = useApp(s => s.mode)

  const dot =
    mode === 'listening' ? '#58b0ff' :
    mode === 'enhancing' ? '#ffb74d' :
    mode === 'speaking'  ? '#66bb6a' :
    mode === 'asr'       ? '#bb86fc' :
                           '#9e9e9e'

  return (
    <div className="mode-badge" title="Current mode">
      <span
        style={{
          display: 'inline-block',
          width: 8, height: 8, borderRadius: '50%',
          background: dot, boxShadow: `0 0 12px ${dot}66`
        }}
      />
      {mode.toUpperCase()}
    </div>
  )
}
