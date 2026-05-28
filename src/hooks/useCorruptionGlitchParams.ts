import { useEffect, useState } from 'react'
import { useCorruption } from '../context/CorruptionContext'
import {
  computeCorruptionGlitchParams,
  type CorruptionGlitchParams,
} from '../utils/corruptionRamp'

const IDLE_PARAMS = computeCorruptionGlitchParams(0)

export function useCorruptionGlitchParams(): CorruptionGlitchParams {
  const { isCorrupted } = useCorruption()
  const [params, setParams] = useState<CorruptionGlitchParams>(IDLE_PARAMS)

  useEffect(() => {
    if (!isCorrupted) {
      setParams(IDLE_PARAMS)
      return
    }

    const startedAt = performance.now()
    let frameId = 0

    const tick = () => {
      const elapsed = performance.now() - startedAt
      setParams(computeCorruptionGlitchParams(elapsed))
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [isCorrupted])

  return params
}
