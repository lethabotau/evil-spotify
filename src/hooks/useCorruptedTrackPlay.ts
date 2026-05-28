import { useCallback } from 'react'
import { useCorruption } from '../context/CorruptionContext'

export function useCorruptedTrackPlay() {
  const { isCorrupted, startCorruption, incrementClick, requestPlaybackRestart } =
    useCorruption()

  return useCallback(() => {
    if (!isCorrupted) {
      startCorruption()
      return
    }
    incrementClick()
    requestPlaybackRestart()
  }, [isCorrupted, startCorruption, incrementClick, requestPlaybackRestart])
}
