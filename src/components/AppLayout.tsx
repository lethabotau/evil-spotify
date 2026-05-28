import { Outlet } from 'react-router-dom'
import { useCorruption } from '../context/CorruptionContext'
import {
  CorruptionEffectsOverlay,
  useCorruptionGlitchStyles,
} from './CorruptionEffects'
import { PlaybackBar } from './PlaybackBar.tsx'
import { Sidebar } from './Sidebar.tsx'
import './app-layout.css'

export function AppLayout() {
  const { isCorrupted } = useCorruption()
  const glitchStyles = useCorruptionGlitchStyles()

  return (
    <div
      className={`app-layout${isCorrupted ? ' app-layout--corrupted' : ''}`}
      style={glitchStyles}
    >
      <CorruptionEffectsOverlay />
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>
      <PlaybackBar />
    </div>
  )
}
