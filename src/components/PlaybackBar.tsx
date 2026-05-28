import { useCallback, useEffect, useRef, useState } from 'react'
import corruptedAudio from '../assets/slimey_modded.mp3'
import {
  CORRUPTED_TRACK_DURATION,
  CORRUPTED_TRACK_DURATION_SECONDS,
} from '../constants/corruption'
import { useCorruption } from '../context/CorruptionContext'
import { useCorruptedDisplay } from '../hooks/useCorruptedDisplay'
import { formatArtistNames, formatDuration } from '../utils/format'
import { getAccessToken } from '../utils/spotifyAuth'
import { getRecentlyPlayedTracks, type SpotifyTrack } from '../utils/spotify'
import './playback-bar.css'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  return formatDuration(seconds * 1000)
}

export function PlaybackBar() {
  const { isCorrupted, flashbangActive, playbackRestartKey, maxVolume } = useCorruption()
  const { playlistImage, trackName, artistLabel } = useCorruptedDisplay()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [recentTrack, setRecentTrack] = useState<SpotifyTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [spotifyDuration, setSpotifyDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)

  useEffect(() => {
    if (!getAccessToken()) return

    let cancelled = false

    getRecentlyPlayedTracks(1)
      .then((data) => {
        if (cancelled) return
        const track = data.items[0]?.track ?? null
        setRecentTrack(track)
        if (track) {
          setSpotifyDuration(track.duration_ms / 1000)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const restartTrack = useCallback((autoplay = true) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    setCurrentTime(0)
    if (autoplay) {
      audio.play().catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!flashbangActive) return
    restartTrack(true)
  }, [flashbangActive, restartTrack])

  useEffect(() => {
    if (!isCorrupted || playbackRestartKey === 0) return
    restartTrack(true)
  }, [playbackRestartKey, isCorrupted, restartTrack])

  const effectiveVolume = (() => {
    if (maxVolume) return 1
    if (isCorrupted && volume > 0.85) return 0.85
    return volume
  })()

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = effectiveVolume
  }, [effectiveVolume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setAudioDuration(audio.duration)
      }
    }

    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      audio.currentTime = 0
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    syncDuration()
    audio.addEventListener('loadedmetadata', syncDuration)
    audio.addEventListener('durationchange', syncDuration)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.removeEventListener('loadedmetadata', syncDuration)
      audio.removeEventListener('durationchange', syncDuration)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [])

  useEffect(() => {
    if (!isPlaying) return

    const audio = audioRef.current
    if (!audio) return

    let frameId = 0
    const tick = () => {
      setCurrentTime(audio.currentTime)
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [isPlaying])

  function handlePlayPause() {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }

  function handlePrevious() {
    restartTrack(true)
  }

  function handleNext() {
    restartTrack(true)
  }

  function handleVolumeChange(next: number) {
    setVolume(Math.max(0, Math.min(1, next)))
  }

  const volumeFillPercent = volume * 100

  const recentImage = recentTrack?.album.images[0]?.url
  const idleTitle = recentTrack?.name ?? 'Choose a song'
  const idleArtist = recentTrack ? formatArtistNames(recentTrack.artists) : '—'

  const title = trackName(idleTitle)
  const artist = artistLabel(idleArtist)
  const artSrc = playlistImage(recentImage)

  const playbackDuration =
    audioDuration > 0
      ? audioDuration
      : isCorrupted
        ? CORRUPTED_TRACK_DURATION_SECONDS
        : 0

  const progressPercent =
    playbackDuration > 0 ? Math.min(100, (currentTime / playbackDuration) * 100) : 0

  const elapsed = formatTime(currentTime)
  const total = isCorrupted
    ? CORRUPTED_TRACK_DURATION
    : playbackDuration > 0
      ? formatTime(playbackDuration)
      : recentTrack
        ? formatTime(spotifyDuration)
        : '0:00'

  return (
    <footer className="playback-bar" aria-label="Player">
      <audio ref={audioRef} src={corruptedAudio} preload="auto" />

      <div className="playback-bar__now-playing">
        {artSrc ? (
          <img src={artSrc} alt="" className="playback-bar__art" />
        ) : (
          <div className="playback-bar__art playback-bar__art--empty" />
        )}
        <div className="playback-bar__track">
          <span className="playback-bar__title">{title}</span>
          {(artist || isCorrupted) && (
            <span className="playback-bar__artist">{artist}</span>
          )}
        </div>
      </div>

      <div className="playback-bar__controls">
        <div className="playback-bar__buttons">
          <button
            type="button"
            className="playback-bar__btn"
            aria-label="Previous"
            onClick={handlePrevious}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="playback-bar__btn playback-bar__btn--play"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"
                />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="playback-bar__btn"
            aria-label="Next"
            onClick={handleNext}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"
              />
            </svg>
          </button>
        </div>
        <div className="playback-bar__progress">
          <span className="playback-bar__time">{elapsed}</span>
          <div className="playback-bar__progress-track">
            <div
              className="playback-bar__progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="playback-bar__time">{total}</span>
        </div>
      </div>

      <div className="playback-bar__extras">
        <div className="playback-bar__volume">
          <div
            className="playback-bar__volume-fill"
            style={{ width: `${volumeFillPercent}%` }}
          />
          <input
            type="range"
            className="playback-bar__volume-input"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volume * 100)}
          />
        </div>
      </div>
    </footer>
  )
}
