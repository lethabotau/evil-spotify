import type { CSSProperties } from 'react'
import { useCorruption } from '../context/CorruptionContext'
import { useCorruptionGlitchParams } from '../hooks/useCorruptionGlitchParams'
import { corruptionGlitchStyleProperties } from '../utils/corruptionRamp'
import './corruption-effects.css'

export function useCorruptionGlitchStyles(): CSSProperties | undefined {
  const { isCorrupted } = useCorruption()
  const params = useCorruptionGlitchParams()

  if (!isCorrupted) return undefined

  return corruptionGlitchStyleProperties(params) as CSSProperties
}

export function CorruptionEffectsOverlay() {
  const { isCorrupted } = useCorruption()
  const params = useCorruptionGlitchParams()

  if (!isCorrupted) return null

  const layerStyle = corruptionGlitchStyleProperties(params) as CSSProperties

  return (
    <div className="corruption-fx-layer" style={layerStyle} aria-hidden>
      <div className="corruption-fx corruption-fx--scanlines" />
      <div className="corruption-fx corruption-fx--noise" />
      <div className="corruption-fx corruption-fx--rgb-ramp" />
      <div className="corruption-fx corruption-fx--vignette" />
    </div>
  )
}
