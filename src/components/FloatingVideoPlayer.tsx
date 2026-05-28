import { useEffect, useRef, useState } from 'react'
import serenaVideo from '../assets/serena.mp4'
import { useCorruption } from '../context/CorruptionContext'
import './floating-video.css'

const VIDEO_WIDTH = 300
const VIDEO_HEIGHT = 170
const MAX_VIDEO_INSTANCES = 8
const VIDEO_APPEAR_DELAY_MS = 8_000
const MULTIPLY_INTERVAL_MS = 4_000
const POSITION_JUMP_INTERVAL_MS = 800

interface VideoInstance {
  id: number
  x: number
  y: number
}

function randomPosition() {
  const maxX = Math.max(0, window.innerWidth - VIDEO_WIDTH)
  const maxY = Math.max(0, window.innerHeight - VIDEO_HEIGHT)
  return {
    x: Math.random() * maxX,
    y: Math.random() * maxY,
  }
}

function createInstances(count: number, previous: VideoInstance[] = []): VideoInstance[] {
  return Array.from({ length: count }, (_, index) => {
    const kept = previous[index]
    if (kept) return { ...kept, id: index }
    return { id: index, ...randomPosition() }
  })
}

export function FloatingVideoPlayer() {
  const { isCorrupted } = useCorruption()
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())
  const positionTimersRef = useRef<Map<number, number>>(new Map())
  const [active, setActive] = useState(false)
  const [instances, setInstances] = useState<VideoInstance[]>([])

  const clearPositionTimers = () => {
    positionTimersRef.current.forEach((timerId) => window.clearInterval(timerId))
    positionTimersRef.current.clear()
  }

  const startPositionTimer = (instanceId: number) => {
    const jump = () => {
      setInstances((current) =>
        current.map((instance) =>
          instance.id === instanceId ? { ...instance, ...randomPosition() } : instance,
        ),
      )
    }

    jump()
    const timerId = window.setInterval(jump, POSITION_JUMP_INTERVAL_MS)
    positionTimersRef.current.set(instanceId, timerId)
  }

  const syncPositionTimers = (instanceIds: number[]) => {
    const idSet = new Set(instanceIds)

    for (const [id, timerId] of positionTimersRef.current) {
      if (!idSet.has(id)) {
        window.clearInterval(timerId)
        positionTimersRef.current.delete(id)
      }
    }

    for (const id of instanceIds) {
      if (!positionTimersRef.current.has(id)) {
        startPositionTimer(id)
      }
    }
  }

  useEffect(() => {
    if (!isCorrupted) {
      setActive(false)
      setInstances([])
      clearPositionTimers()
      videoRefs.current.forEach((video) => video.pause())
      videoRefs.current.clear()
      return
    }

    const appearTimer = window.setTimeout(() => {
      setActive(true)
      setInstances(createInstances(1))
    }, VIDEO_APPEAR_DELAY_MS)

    return () => {
      window.clearTimeout(appearTimer)
    }
  }, [isCorrupted])

  const instanceIdKey = instances.map((instance) => instance.id).join(',')

  useEffect(() => {
    if (!active) return

    const ids = instanceIdKey ? instanceIdKey.split(',').map(Number) : []
    syncPositionTimers(ids)

    return () => {
      clearPositionTimers()
    }
  }, [active, instanceIdKey])

  useEffect(() => {
    if (!active) return

    const onResize = () => {
      setInstances((current) => {
        const maxX = Math.max(0, window.innerWidth - VIDEO_WIDTH)
        const maxY = Math.max(0, window.innerHeight - VIDEO_HEIGHT)
        return current.map((instance) => ({
          ...instance,
          x: Math.min(instance.x, maxX),
          y: Math.min(instance.y, maxY),
        }))
      })
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [active])

  useEffect(() => {
    if (!active) return

    const multiplyTimer = window.setInterval(() => {
      setInstances((current) => {
        const nextCount = Math.min(MAX_VIDEO_INSTANCES, current.length * 2)
        if (nextCount === current.length) return current
        return createInstances(nextCount, current)
      })
    }, MULTIPLY_INTERVAL_MS)

    return () => window.clearInterval(multiplyTimer)
  }, [active])

  useEffect(() => {
    if (!active) return

    videoRefs.current.forEach((video) => {
      video.loop = true
      video.play().catch(() => {})
    })
  }, [instances, active])

  if (!active || instances.length === 0) return null

  return (
    <div className="floating-video-layer" aria-hidden>
      {instances.map((instance) => (
        <div
          key={instance.id}
          className="floating-video"
          style={{ left: instance.x, top: instance.y }}
        >
          <video
            ref={(el) => {
              if (el) videoRefs.current.set(instance.id, el)
              else videoRefs.current.delete(instance.id)
            }}
            className="floating-video__media"
            src={serenaVideo}
            autoPlay
            loop
            playsInline
            disablePictureInPicture
            controls={false}
          />
        </div>
      ))}
    </div>
  )
}
