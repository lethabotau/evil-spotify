import { useEffect, useRef } from 'react'
import serenaVideo from '../assets/serena.mp4'
import { useCorruption } from '../context/CorruptionContext'
import './floating-video.css'

const VIDEO_WIDTH = 300
const VIDEO_HEIGHT = 170
const MIN_SPEED = 55
const MAX_SPEED = 130

function randomSpeed(): number {
  const sign = Math.random() < 0.5 ? -1 : 1
  return sign * (MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED))
}

function clampPosition(x: number, y: number) {
  const maxX = Math.max(0, window.innerWidth - VIDEO_WIDTH)
  const maxY = Math.max(0, window.innerHeight - VIDEO_HEIGHT)
  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
    maxX,
    maxY,
  }
}

export function FloatingVideoPlayer() {
  const { isCorrupted } = useCorruption()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const motionRef = useRef({
    x: 0,
    y: 0,
    vx: randomSpeed(),
    vy: randomSpeed(),
  })

  useEffect(() => {
    if (!isCorrupted) return

    const video = videoRef.current
    if (video) {
      video.muted = true
      video.loop = true
      video.play().catch(() => {})
    }

    const startX = Math.random() * Math.max(0, window.innerWidth - VIDEO_WIDTH)
    const startY = Math.random() * Math.max(0, window.innerHeight - VIDEO_HEIGHT)
    const start = clampPosition(startX, startY)
    motionRef.current.x = start.x
    motionRef.current.y = start.y
    motionRef.current.vx = randomSpeed()
    motionRef.current.vy = randomSpeed()

    let lastTime = performance.now()
    let frameId = 0

    const tick = (now: number) => {
      const container = containerRef.current
      if (!container) return

      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      const motion = motionRef.current
      const bounds = clampPosition(motion.x, motion.y)

      motion.x += motion.vx * dt
      motion.y += motion.vy * dt

      if (motion.x <= 0) {
        motion.x = 0
        motion.vx = Math.abs(motion.vx) * (0.9 + Math.random() * 0.2)
        motion.vy += (Math.random() - 0.5) * 20
      } else if (motion.x >= bounds.maxX) {
        motion.x = bounds.maxX
        motion.vx = -Math.abs(motion.vx) * (0.9 + Math.random() * 0.2)
        motion.vy += (Math.random() - 0.5) * 20
      }

      if (motion.y <= 0) {
        motion.y = 0
        motion.vy = Math.abs(motion.vy) * (0.9 + Math.random() * 0.2)
        motion.vx += (Math.random() - 0.5) * 20
      } else if (motion.y >= bounds.maxY) {
        motion.y = bounds.maxY
        motion.vy = -Math.abs(motion.vy) * (0.9 + Math.random() * 0.2)
        motion.vx += (Math.random() - 0.5) * 20
      }

      const speed = Math.hypot(motion.vx, motion.vy)
      if (speed < MIN_SPEED) {
        const scale = MIN_SPEED / speed
        motion.vx *= scale
        motion.vy *= scale
      } else if (speed > MAX_SPEED * 1.2) {
        const scale = (MAX_SPEED * 1.2) / speed
        motion.vx *= scale
        motion.vy *= scale
      }

      container.style.transform = `translate3d(${motion.x}px, ${motion.y}px, 0)`
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    const onResize = () => {
      const motion = motionRef.current
      const bounds = clampPosition(motion.x, motion.y)
      motion.x = bounds.x
      motion.y = bounds.y
    }

    window.addEventListener('resize', onResize)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      video?.pause()
    }
  }, [isCorrupted])

  if (!isCorrupted) return null

  return (
    <div
      ref={containerRef}
      className="floating-video"
      aria-hidden
    >
      <video
        ref={videoRef}
        className="floating-video__media"
        src={serenaVideo}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        controls={false}
      />
    </div>
  )
}
