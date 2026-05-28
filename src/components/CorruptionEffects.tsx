import { useEffect, useState } from 'react'
import { useCorruption } from '../context/CorruptionContext'
import './corruption-effects.css'

const SHAKE_INTERVAL_MS = 4500
const SHAKE_DURATION_MS = 380

export function useCorruptionShakeClass(): string {
  const { isCorrupted } = useCorruption()
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    if (!isCorrupted) {
      setShaking(false)
      return
    }

    let shakeTimeout: ReturnType<typeof setTimeout> | undefined

    const intervalId = window.setInterval(() => {
      setShaking(true)
      shakeTimeout = window.setTimeout(() => setShaking(false), SHAKE_DURATION_MS)
    }, SHAKE_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
      if (shakeTimeout !== undefined) window.clearTimeout(shakeTimeout)
    }
  }, [isCorrupted])

  if (!isCorrupted) return ''
  return shaking ? ' app-layout--shake' : ''
}

export function CorruptionEffectsOverlay() {
  const { isCorrupted } = useCorruption()
  if (!isCorrupted) return null

  return (
    <div className="corruption-fx-layer" aria-hidden>
      <div className="corruption-fx corruption-fx--scanlines" />
      <div className="corruption-fx corruption-fx--noise" />
      <div className="corruption-fx corruption-fx--rgb" />
    </div>
  )
}
