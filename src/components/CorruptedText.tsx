import type { ReactNode } from 'react'
import { useCorruption } from '../context/CorruptionContext'
import './corrupted-text.css'

interface CorruptedTextProps {
  children: ReactNode
  className?: string
}

export function CorruptedText({ children, className = '' }: CorruptedTextProps) {
  const { isCorrupted } = useCorruption()
  const classes = [className, isCorrupted ? 'corrupted-text' : ''].filter(Boolean).join(' ')

  return <span className={classes || undefined}>{children}</span>
}
