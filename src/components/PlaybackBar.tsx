import { useEffect, useRef, useState } from 'react'
import corruptedAudio from '../assets/slimey_modded.mp3'
import { useCorruption } from '../context/CorruptionContext'
import { formatArtistNames, formatDuration } from '../utils/format'
import { getAccessToken } from '../utils/spotifyAuth'
import { getRecentlyPlayedTracks, type SpotifyTrack } from '../utils/spotify'
import './playback-bar.css'

const CORRUPTED_TRACK_TITLE = '2Slimey - Roc (Bass Boosted 🔊)'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  return formatDuration(seconds * 1000)
}

export function PlaybackBar() {
  const { isCorrupted, clickCount } = useCorruption()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [recentTrack, setRecentTrack] = useState<SpotifyTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!getAccessToken()) return

    let cancelled = false

    getRecentlyPlayedTracks(1)
      .then((data) => {
        if (cancelled) return
        const track = data.items[0]?.track ?? null
        setRecentTrack(track)
        if (track) {
          setDuration(track.duration_ms / 1000)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isCorrupted) return
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [isCorrupted, clickCount])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('durationchange', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('durationchange', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [])

  function handlePlayPause() {
    if (!isCorrupted) return

    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }

  const recentImage = recentTrack?.album.images[0]?.url
  const idleTitle = recentTrack?.name ?? 'Choose a song'
  const idleArtist = recentTrack ? formatArtistNames(recentTrack.artists) : '—'

  const title = isCorrupted ? CORRUPTED_TRACK_TITLE : idleTitle
  const artist = isCorrupted ? '' : idleArtist

  const progressPercent = isCorrupted
    ? duration > 0
      ? (currentTime / duration) * 100
      : 0
    : 0

  const elapsed = isCorrupted ? formatTime(currentTime) : '0:00'
  const total = isCorrupted
    ? formatTime(duration)
    : recentTrack
      ? formatTime(recentTrack.duration_ms / 1000)
      : '0:00'

  return (
    <footer className="playback-bar" aria-label="Player">
      <audio ref={audioRef} src={corruptedAudio} preload="metadata" />

      <div className="playback-bar__now-playing">
        {recentImage && !isCorrupted ? (
          <img src={recentImage} alt="" className="playback-bar__art" />
        ) : (
          <div
            className={`playback-bar__art${isCorrupted ? ' playback-bar__art--active' : ' playback-bar__art--empty'}`}
          />
        )}
        <div className="playback-bar__track">
          <span className="playback-bar__title">{title}</span>
          {artist && <span className="playback-bar__artist">{artist}</span>}
        </div>
      </div>

      <div className="playback-bar__controls">
        <div className="playback-bar__buttons">
          <button type="button" className="playback-bar__btn" aria-label="Shuffle" disabled>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-.6.8H4.5a.75.75 0 0 0 0 1.5h2.325a.75.75 0 0 0 .61-.316l1.013-1.35A2.25 2.25 0 0 1 11.16 4.5h1.95l-1.017 1.018a.75.75 0 1 0 1.06 1.06L15.98 3.75V6a.75.75 0 0 0 1.5 0V1.5a.75.75 0 0 0-.922-.728l.001.001zM2.5 13.5a.75.75 0 0 0 1.06 0L4.576 12.54 6.525 14.5H8.25a.75.75 0 0 0 0-1.5H6.525a2.25 2.25 0 0 1-1.732-.804l-.6-.8H4.5a.75.75 0 0 0 0 1.5h1.325a.75.75 0 0 0 .61.316l1.013 1.35A2.25 2.25 0 0 0 8.25 14.5h1.95l-1.017-1.018a.75.75 0 1 0-1.06-1.06L2.02 14.25V12a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-2.25l.48.48z"
              />
            </svg>
          </button>
          <button type="button" className="playback-bar__btn" aria-label="Previous" disabled>
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
            disabled={!isCorrupted}
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
          <button type="button" className="playback-bar__btn" aria-label="Next" disabled>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"
              />
            </svg>
          </button>
          <button type="button" className="playback-bar__btn" aria-label="Repeat" disabled>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12.25H12.25a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.75 4.75v1.5a.75.75 0 0 1-1.5 0v-1.5z"
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
        <button type="button" className="playback-bar__btn" aria-label="Volume" disabled>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M9.741.85a.75.75 0 0 1 .986.036l3.478 3.478a.75.75 0 0 1-.036 1.04l-3.478 3.478a.75.75 0 0 1-1.04-.036l-2.5-2.5H2.75A1.75 1.75 0 0 1 1 7.25v-1.5A1.75 1.75 0 0 1 2.75 4h4.475l2.516-2.65zM12.5 8a4.5 4.5 0 0 0-1.59-3.414l-.536.536A3 3 0 0 1 13.5 8c0 .83-.336 1.58-.878 2.122l.536.536A4.5 4.5 0 0 0 12.5 8z"
            />
          </svg>
        </button>
        <div className="playback-bar__volume">
          <div className="playback-bar__volume-fill" style={{ width: '70%' }} />
        </div>
      </div>
    </footer>
  )
}
