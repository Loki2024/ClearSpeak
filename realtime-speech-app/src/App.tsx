import Controls from './components/Controls'
import ModeBadge from './components/ModeBadge'

export default function App() {
  return (
    <div className="container">
      <div className="header-row">
        <h1>🎧 Real-Time Speech Assist</h1>
        <ModeBadge />
      </div>
      <Controls />
    </div>
  )
}
