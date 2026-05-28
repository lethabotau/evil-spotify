import type { MouseEvent } from 'react'
import { useCorruption } from '../context/CorruptionContext'
import './play-button.css'

interface PlayButtonProps {
  size?: 'sm' | 'lg'
  label?: string
  /** When true, increments corruption (playlist track rows only). */
  enableCorruption?: boolean
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
}

export function PlayButton({
  size = 'sm',
  label = 'Play',
  enableCorruption = false,
  onClick,
}: PlayButtonProps) {
  const { incrementClick } = useCorruption()

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (enableCorruption) {
      incrementClick()
    }
    onClick?.(e)
  }

  return (
    <button
      type="button"
      className={`play-button play-button--${size}`}
      aria-label={label}
      onClick={handleClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M8 5.14v14l11-7-11-7z" />
      </svg>
    </button>
  )
}
