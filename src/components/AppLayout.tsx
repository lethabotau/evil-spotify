import { Outlet } from 'react-router-dom'
import { useCorruption } from '../context/CorruptionContext'
import {
  CorruptionEffectsOverlay,
  useCorruptionGlitchStyles,
} from './CorruptionEffects'
import { CorruptionTextMeltFilter } from './CorruptionTextMeltFilter'
import { useCorruptionGlitchParams } from '../hooks/useCorruptionGlitchParams'
import { PlaybackBar } from './PlaybackBar.tsx'
import { Sidebar } from './Sidebar.tsx'
import './app-layout.css'

export function AppLayout() {
  const { isCorrupted } = useCorruption()
  const glitchStyles = useCorruptionGlitchStyles()
  const glitchParams = useCorruptionGlitchParams()

  return (
    <div
      className={[
        'app-layout',
        isCorrupted && 'app-layout--corrupted corruption-glitch-surface',
        isCorrupted && glitchParams.textMeltProgress > 0 && 'app-layout--text-melt',
      ]
        .filter(Boolean)
        .join(' ')}
      style={glitchStyles}
    >
      <CorruptionTextMeltFilter />
      <CorruptionEffectsOverlay />
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>
      <PlaybackBar />
    </div>
  )
}
