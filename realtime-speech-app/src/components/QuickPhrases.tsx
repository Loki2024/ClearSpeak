import { useState } from 'react'
import { useApp } from '../store'
import { speak } from '../audio/pipeline'

export default function QuickPhrases() {
  const { phrases, addPhrase, removePhrase } = useApp()
  const [newText, setNewText] = useState('')

  return (
    <div style={{ marginTop: 18 }}>
      <h3>Quick Phrases</h3>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a phrase..."
          style={{ flex: 1 }}
        />
        <button className="button-primary"
          onClick={() => {
            if (newText.trim()) {
              addPhrase(newText.trim())
              setNewText('')
            }
          }}
        >
          Add
        </button>
      </div>

      <ul style={{ marginTop: 12, paddingLeft: 0, listStyle: 'none' }}>
        {phrases.map((p) => (
          <li
            key={p.id}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              marginBottom: 8,
              background: 'linear-gradient(180deg, #101826, #0b1320)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '8px 10px'
            }}
          >
            <button onClick={() => speak(p.text)} title="Speak" style={{ padding: '8px 10px' }}>▶︎</button>
            <span style={{ flex: 1, color: '#dfe7f3' }}>{p.text}</span>
            <button onClick={() => removePhrase(p.id)} title="Remove" className="button-danger">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
