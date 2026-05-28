import { Outlet } from 'react-router-dom'
import { useCorruption } from '../context/CorruptionContext'
import {
  CorruptionEffectsOverlay,
  useCorruptionShakeClass,
} from './CorruptionEffects'
import { PlaybackBar } from './PlaybackBar'
import { Sidebar } from './Sidebar'
import './app-layout.css'

export function AppLayout() {
  const { isCorrupted } = useCorruption()
  const shakeClass = useCorruptionShakeClass()

  return (
    <div
      className={`app-layout${isCorrupted ? ' app-layout--corrupted' : ''}${shakeClass}`}
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
