import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface CorruptionContextValue {
  clickCount: number
  isCorrupted: boolean
  incrementClick: () => void
}

const CorruptionContext = createContext<CorruptionContextValue | null>(null)

export function CorruptionProvider({ children }: { children: ReactNode }) {
  const [clickCount, setClickCount] = useState(0)
  const isCorrupted = clickCount >= 1

  const incrementClick = useCallback(() => {
    setClickCount((count) => count + 1)
  }, [])

  const value = useMemo(
    (): CorruptionContextValue => ({
      clickCount,
      isCorrupted,
      incrementClick,
    }),
    [clickCount, isCorrupted, incrementClick],
  )

  return (
    <CorruptionContext.Provider value={value}>{children}</CorruptionContext.Provider>
  )
}

export function useCorruption(): CorruptionContextValue {
  const context = useContext(CorruptionContext)
  if (!context) {
    throw new Error('useCorruption must be used within a CorruptionProvider')
  }
  return context
}
