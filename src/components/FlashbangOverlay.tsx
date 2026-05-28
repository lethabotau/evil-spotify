import { useEffect, useState } from 'react'
import { CORRUPTED_COVER_SRC } from '../constants/corruption'
import './flashbang.css'

const FLASH_COUNT = 5
const FLASH_INTERVAL_MS = 120
const HOLD_MS = 200
const FADE_MS = 350

interface FlashbangOverlayProps {
  onComplete: () => void
}

export function FlashbangOverlay({ onComplete }: FlashbangOverlayProps) {
  const [flashWhite, setFlashWhite] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    let flashStep = 0
    const flashTimer = window.setInterval(() => {
      flashStep += 1
      setFlashWhite((current) => !current)
      if (flashStep >= FLASH_COUNT * 2) {
        window.clearInterval(flashTimer)
        window.setTimeout(() => {
          setFading(true)
          window.setTimeout(onComplete, FADE_MS)
        }, HOLD_MS)
      }
    }, FLASH_INTERVAL_MS)

    return () => {
      window.clearInterval(flashTimer)
      document.body.style.overflow = previousOverflow
    }
  }, [onComplete])

  return (
    <div
      className={`flashbang${fading ? ' flashbang--fade-out' : ''}`}
      role="alert"
      aria-live="assertive"
      aria-label="Flash effect"
    >
      <div
        className={`flashbang__backdrop${flashWhite ? ' flashbang__backdrop--white' : ' flashbang__backdrop--red'}`}
      />
      <img src={CORRUPTED_COVER_SRC} alt="" className="flashbang__image" />
    </div>
  )
}
