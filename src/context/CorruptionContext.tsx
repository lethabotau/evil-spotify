import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { FlashbangOverlay } from '../components/FlashbangOverlay'

export interface CorruptionContextValue {
  isCorrupted: boolean
  flashbangActive: boolean
  startCorruption: () => void
}

const CorruptionContext = createContext<CorruptionContextValue | null>(null)

export function CorruptionProvider({ children }: { children: ReactNode }) {
  const [isCorrupted, setIsCorrupted] = useState(false)
  const [flashbangActive, setFlashbangActive] = useState(false)

  const startCorruption = useCallback(() => {
    if (isCorrupted || flashbangActive) return
    setFlashbangActive(true)
  }, [isCorrupted, flashbangActive])

  const completeCorruption = useCallback(() => {
    setIsCorrupted(true)
    setFlashbangActive(false)
  }, [])

  const value = useMemo(
    (): CorruptionContextValue => ({
      isCorrupted,
      flashbangActive,
      startCorruption,
    }),
    [isCorrupted, flashbangActive, startCorruption],
  )

  return (
    <CorruptionContext.Provider value={value}>
      {children}
      {flashbangActive && <FlashbangOverlay onComplete={completeCorruption} />}
    </CorruptionContext.Provider>
  )
}

export function useCorruption(): CorruptionContextValue {
  const context = useContext(CorruptionContext)
  if (!context) {
    throw new Error('useCorruption must be used within a CorruptionProvider')
  }
  return context
}
