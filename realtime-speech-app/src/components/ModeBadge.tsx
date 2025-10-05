import { useApp } from '../store'

export default function ModeBadge() {
  // ✅ Ensure correct access and typing
  const mode = useApp((state) => state.mode)

  if (!mode) return null

  const color =
    mode === 'listening'
      ? '#58b0ff'
      : mode === 'enhancing'
      ? '#ffb74d'
      : mode === 'speaking'
      ? '#66bb6a'
      : '#9e9e9e'

  return (
    <div
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: '12px',
        background: color,
        color: '#0a0a0a',
        fontWeight: 600,
        fontSize: '0.8rem',
        marginLeft: 8,
        minWidth: 80,
        textAlign: 'center',
      }}
    >
      {mode.toUpperCase()}
    </div>
  )
}
