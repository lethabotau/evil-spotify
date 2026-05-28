import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PlayButton } from '../components/PlayButton'
import {
  formatArtistNames,
  formatDuration,
  formatTotalDuration,
} from '../utils/format'
import {
  getAllPlaylistTracks,
  getPlaylist,
  getPlaylistItemCount,
  getSpotifyErrorMessage,
  type SpotifyPlaylist,
  type SpotifyPlaylistTrackItem,
  type SpotifyTrack,
} from '../utils/spotify'
import './playlist.css'

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent ?? html
}

export function Playlist() {
  const { id } = useParams<{ id: string }>()
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null)
  const [tracks, setTracks] = useState<SpotifyPlaylistTrackItem[]>([])
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

    const playlistId = id

    async function load() {
      try {
        const playlistData = await getPlaylist(playlistId)
        if (cancelled) return
        setPlaylist(playlistData)

        try {
          const trackItems = await getAllPlaylistTracks(playlistId)
          if (cancelled) return
          setTracks(trackItems.filter((item) => item.track !== null))
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
    () =>
      tracks.reduce((sum, item) => sum + (item.track?.duration_ms ?? 0), 0),
    [tracks],
  )

  if (!id) {
    return <p className="playlist-page__status playlist-page__status--error">Invalid playlist</p>
  }

  if (loading) {
    return <p className="playlist-page__status">Loading playlist…</p>
  }

  if (error || !playlist) {
    return (
      <p className="playlist-page__status playlist-page__status--error">
        {error ?? 'Playlist not found'}
      </p>
    )
  }

  const coverUrl = playlist.images[0]?.url
  const ownerName = playlist.owner.display_name ?? 'Unknown'
  const visibility = playlist.public === false ? 'Private playlist' : 'Public playlist'
  const description = playlist.description
    ? stripHtml(playlist.description)
    : null
  const trackCount = getPlaylistItemCount(playlist)

  return (
    <div className="playlist-page">
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
            <span className="playlist-hero__type">{visibility}</span>
            <h1 className="playlist-hero__title">{playlist.name}</h1>
            <div className="playlist-hero__stats">
              <span className="playlist-hero__owner">{ownerName}</span>
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
            {description && <p className="playlist-hero__description">{description}</p>}
          </div>
        </div>
      </header>

      <div className="playlist-toolbar">
        <PlayButton size="lg" label={`Play ${playlist.name}`} />
      </div>

      {tracksError && (
        <p className="playlist-page__tracks-error">{tracksError}</p>
      )}

      {!tracksError && (
      <div className="playlist-tracks" role="table" aria-label="Playlist tracks">
        <div className="playlist-tracks__header" role="row">
          <span className="playlist-tracks__col playlist-tracks__col--index" role="columnheader">
            #
          </span>
          <span className="playlist-tracks__col playlist-tracks__col--title" role="columnheader">
            Title
          </span>
          <span className="playlist-tracks__col playlist-tracks__col--album" role="columnheader">
            Album
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
          {tracks.map((item, index) => (
            <TrackRow key={`${item.track?.id ?? index}-${index}`} index={index + 1} track={item.track!} />
          ))}
        </div>
      </div>
      )}
    </div>
  )
}

function TrackRow({ index, track }: { index: number; track: SpotifyTrack }) {
  const albumImage = track.album.images[track.album.images.length - 1]?.url

  return (
    <div className="playlist-tracks__row" role="row">
      <span className="playlist-tracks__col playlist-tracks__col--index" role="cell">
        <span className="playlist-tracks__index">{index}</span>
        <span className="playlist-tracks__play-icon" aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path fill="currentColor" d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z" />
          </svg>
        </span>
      </span>
      <div className="playlist-tracks__col playlist-tracks__col--title" role="cell">
        {albumImage ? (
          <img src={albumImage} alt="" className="playlist-tracks__thumb" />
        ) : (
          <span className="playlist-tracks__thumb playlist-tracks__thumb--placeholder" />
        )}
        <div className="playlist-tracks__title-block">
          <span className="playlist-tracks__track-name">
            {track.name}
            {track.explicit && (
              <span className="playlist-tracks__explicit" title="Explicit">
                E
              </span>
            )}
          </span>
          <span className="playlist-tracks__artist">{formatArtistNames(track.artists)}</span>
        </div>
      </div>
      <span className="playlist-tracks__col playlist-tracks__col--album" role="cell">
        {track.album.name}
      </span>
      <span className="playlist-tracks__col playlist-tracks__col--duration" role="cell">
        {formatDuration(track.duration_ms)}
      </span>
    </div>
  )
}
