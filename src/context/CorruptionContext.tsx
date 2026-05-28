import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { FlashbangOverlay } from '../components/FlashbangOverlay'
import { FloatingVideoPlayer } from '../components/FloatingVideoPlayer'

const MAX_CLICK_COUNT = 9

export interface CorruptionContextValue {
  isCorrupted: boolean
  flashbangActive: boolean
  clickCount: number
  intenseGlitch: boolean
  showVideo: boolean
  maxVolume: boolean
  nuclear: boolean
  startCorruption: () => void
  incrementClick: () => void
}

const CorruptionContext = createContext<CorruptionContextValue | null>(null)

export function CorruptionProvider({ children }: { children: ReactNode }) {
  const [isCorrupted, setIsCorrupted] = useState(false)
  const [flashbangActive, setFlashbangActive] = useState(false)
  const [clickCount, setClickCount] = useState(0)

  const intenseGlitch = clickCount >= 3
  const showVideo = clickCount >= 5
  const maxVolume = clickCount >= 7
  const nuclear = clickCount >= 9

  const incrementClick = useCallback(() => {
    setClickCount((count) => (count >= MAX_CLICK_COUNT ? count : count + 1))
  }, [])

  const startCorruption = useCallback(() => {
    if (isCorrupted || flashbangActive) return
    setFlashbangActive(true)
  }, [isCorrupted, flashbangActive])

  const completeCorruption = useCallback(() => {
    setIsCorrupted(true)
    setFlashbangActive(false)
    setClickCount((count) => (count === 0 ? 1 : count))
  }, [])

  const value = useMemo(
    (): CorruptionContextValue => ({
      isCorrupted,
      flashbangActive,
      clickCount,
      intenseGlitch,
      showVideo,
      maxVolume,
      nuclear,
      startCorruption,
      incrementClick,
    }),
    [
      isCorrupted,
      flashbangActive,
      clickCount,
      intenseGlitch,
      showVideo,
      maxVolume,
      nuclear,
      startCorruption,
      incrementClick,
    ],
  )

  return (
    <CorruptionContext.Provider value={value}>
      {children}
      {flashbangActive && <FlashbangOverlay onComplete={completeCorruption} />}
      {isCorrupted && <FloatingVideoPlayer />}
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
