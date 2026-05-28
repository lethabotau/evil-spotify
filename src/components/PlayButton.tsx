import type { MouseEvent } from 'react'
import './play-button.css'

interface PlayButtonProps {
  size?: 'sm' | 'lg'
  label?: string
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
}

export function PlayButton({ size = 'sm', label = 'Play', onClick }: PlayButtonProps) {
  return (
    <button
      type="button"
      className={`play-button play-button--${size}`}
      aria-label={label}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M8 5.14v14l11-7-11-7z" />
      </svg>
    </button>
  )
}
