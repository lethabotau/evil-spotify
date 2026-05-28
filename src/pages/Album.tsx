import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCorruptedTrackPlay } from '../hooks/useCorruptedTrackPlay'
import { CorruptedText } from '../components/CorruptedText'
import { useCorruptedDisplay } from '../hooks/useCorruptedDisplay'
import '../components/play-button.css'
import {
  formatArtistNames,
  formatTotalDuration,
  releaseYear,
} from '../utils/format'
import {
  getAlbum,
  getAllAlbumTracks,
  getSpotifyErrorMessage,
  type SpotifyAlbum,
  type SpotifyAlbumTrackSimplified,
} from '../utils/spotify'
import './album.css'
import './playlist.css'

export function Album() {
  const { id } = useParams<{ id: string }>()
  const { playlistImage, heroTitle, artistLabel } = useCorruptedDisplay()
  const [album, setAlbum] = useState<SpotifyAlbum | null>(null)
  const [tracks, setTracks] = useState<SpotifyAlbumTrackSimplified[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tracksError, setTracksError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false
    setLoading(true)
    setError(null)
    setTracksError(null)
    setTracks([])

    const albumId = id

    async function load() {
      try {
        const albumData = await getAlbum(albumId)
        if (cancelled) return
        setAlbum(albumData)

        try {
          const trackItems = await getAllAlbumTracks(albumId)
          if (cancelled) return
          setTracks(trackItems)
        } catch (trackErr) {
          if (cancelled) return
          setTracksError(getSpotifyErrorMessage(trackErr))
        }
      } catch (err) {
        if (cancelled) return
        setError(getSpotifyErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  const totalDurationMs = useMemo(
    () => tracks.reduce((sum, track) => sum + track.duration_ms, 0),
    [tracks],
  )

  if (!id) {
    return <p className="playlist-page__status playlist-page__status--error">Invalid album</p>
  }

  if (loading) {
    return <p className="playlist-page__status">Loading album…</p>
  }

  if (error || !album) {
    return (
      <p className="playlist-page__status playlist-page__status--error">
        {error ?? 'Album not found'}
      </p>
    )
  }

  const coverUrl = playlistImage(album.images[0]?.url)
  const displayTitle = heroTitle(album.name)
  const displayArtist = artistLabel(formatArtistNames(album.artists))
  const year = releaseYear(album.release_date)
  const typeLabel = album.album_type
  const trackCount = album.total_tracks

  return (
    <div className="album-page playlist-page">
      <header
        className="playlist-hero"
        style={
          coverUrl
            ? {
                backgroundImage: `linear-gradient(transparent 0%, var(--bg-base) 75%), linear-gradient(rgba(80, 20, 20, 0.85) 0%, var(--bg-base) 55%)`,
              }
            : undefined
        }
      >
        <div className="playlist-hero__inner">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="playlist-hero__cover" />
          ) : (
            <div className="playlist-hero__cover playlist-hero__cover--placeholder" />
          )}
          <div className="playlist-hero__meta">
            <span className="playlist-hero__type">{typeLabel}</span>
            <h1 className="playlist-hero__title">
              <CorruptedText>{displayTitle}</CorruptedText>
            </h1>
            <div className="playlist-hero__stats">
              <span className="playlist-hero__owner">{displayArtist}</span>
              <span className="playlist-hero__dot" aria-hidden="true">
                •
              </span>
              <span>{year}</span>
              <span className="playlist-hero__dot" aria-hidden="true">
                •
              </span>
              <span>
                {trackCount} {trackCount === 1 ? 'song' : 'songs'}
              </span>
              {totalDurationMs > 0 && (
                <>
                  <span className="playlist-hero__dot" aria-hidden="true">
                    •
                  </span>
                  <span>{formatTotalDuration(totalDurationMs)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="playlist-toolbar">
        <button
          type="button"
          className="play-button play-button--lg play-button--visible"
          aria-label={`Play ${displayTitle}`}
          disabled
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M8 5.14v14l11-7-11-7z" />
          </svg>
        </button>
      </div>

      {tracksError && (
        <p className="playlist-page__tracks-error">{tracksError}</p>
      )}

      {!tracksError && (
        <div className="playlist-tracks" role="table" aria-label="Album tracks">
          <div className="playlist-tracks__header" role="row">
            <span className="playlist-tracks__col playlist-tracks__col--index" role="columnheader">
              #
            </span>
            <span className="playlist-tracks__col playlist-tracks__col--title" role="columnheader">
              Title
            </span>
            <span
              className="playlist-tracks__col playlist-tracks__col--duration"
              role="columnheader"
              aria-label="Duration"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" className="playlist-tracks__clock">
                <path
                  fill="currentColor"
                  d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-3.5a.75.75 0 0 1 .75.75v3.5l2.75 1.65a.75.75 0 1 1-.75 1.28l-3.25-1.95A.75.75 0 0 1 7.25 8V5.25A.75.75 0 0 1 8 4.5z"
                />
              </svg>
            </span>
          </div>

          <div className="playlist-tracks__body">
            {tracks.map((track, index) => (
              <AlbumTrackRow
                key={`${track.id}-${index}`}
                index={index + 1}
                track={track}
                coverUrl={coverUrl}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AlbumTrackRow({
  index,
  track,
  coverUrl,
}: {
  index: number
  track: SpotifyAlbumTrackSimplified
  coverUrl: string | null
}) {
  const handleTrackPlay = useCorruptedTrackPlay()
  const { isCorrupted, playlistImage, trackName, artistLabel, trackDuration } =
    useCorruptedDisplay()
  const thumbSrc = playlistImage(coverUrl)
  const displayName = trackName(track.name)
  const displayArtist = artistLabel(formatArtistNames(track.artists))

  return (
    <div
      className={`playlist-tracks__row${isCorrupted ? ' playlist-tracks__row--corrupted' : ''}`}
      role="row"
      onClick={isCorrupted ? handleTrackPlay : undefined}
      onKeyDown={
        isCorrupted
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleTrackPlay()
              }
            }
          : undefined
      }
      tabIndex={isCorrupted ? 0 : undefined}
    >
      <button
        type="button"
        className="playlist-tracks__col playlist-tracks__col--index playlist-tracks__play-btn"
        aria-label={`Play ${displayName}`}
        onClick={(e) => {
          e.stopPropagation()
          handleTrackPlay()
        }}
      >
        <span className="playlist-tracks__index">{index}</span>
        <span className="playlist-tracks__play-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path
              fill="currentColor"
              d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"
            />
          </svg>
        </span>
      </button>
      <div className="playlist-tracks__col playlist-tracks__col--title" role="cell">
        {thumbSrc ? (
          <img src={thumbSrc} alt="" className="playlist-tracks__thumb" />
        ) : (
          <span className="playlist-tracks__thumb playlist-tracks__thumb--placeholder" />
        )}
        <div className="playlist-tracks__title-block">
          <span className="playlist-tracks__track-name">
            {displayName}
            {!isCorrupted && track.explicit && (
              <span className="playlist-tracks__explicit" title="Explicit">
                E
              </span>
            )}
          </span>
          <span className="playlist-tracks__artist">{displayArtist}</span>
        </div>
      </div>
      <span className="playlist-tracks__col playlist-tracks__col--duration" role="cell">
        {trackDuration(track.duration_ms)}
      </span>
    </div>
  )
}
