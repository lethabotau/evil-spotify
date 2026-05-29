import { useEffect, useState } from 'react'
import { HomeGridCard } from '../components/HomeGridCard'
import { PlaylistScrollCard } from '../components/PlaylistScrollCard'
import { buildRecentGridItems, type HomeGridItem } from '../utils/homeData'
import {
  getRecentlyPlayedTracks,
  getSpotifyErrorMessage,
  getUserPlaylists,
  type SpotifyPlaylist,
} from '../utils/spotify'
import './home.css'

export function Home() {
  const [gridItems, setGridItems] = useState<HomeGridItem[]>([])
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [recentResult, playlistsResult] = await Promise.allSettled([
        getRecentlyPlayedTracks(20),
        getUserPlaylists(50),
      ])

      if (cancelled) return

      const errors: string[] = []

      if (recentResult.status === 'fulfilled' && playlistsResult.status === 'fulfilled') {
        setGridItems(buildRecentGridItems(recentResult.value, playlistsResult.value.items))
        setPlaylists(playlistsResult.value.items)
        setError(null)
        return
      }

      if (playlistsResult.status === 'fulfilled') {
        setPlaylists(playlistsResult.value.items)
        setGridItems([])
      }

      if (recentResult.status === 'rejected') {
        const message = getSpotifyErrorMessage(recentResult.reason)
        if (message) errors.push(message)
      }

      if (playlistsResult.status === 'rejected') {
        const message = getSpotifyErrorMessage(playlistsResult.reason)
        if (message && !errors.includes(message)) errors.push(message)
      }

      setError(errors.length > 0 ? errors[0] : null)
    }

    load()
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = getSpotifyErrorMessage(err)
          if (message) setError(message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const hasContent = gridItems.length > 0 || playlists.length > 0

  return (
    <div className="home">
      {loading && <p className="home__status">Loading…</p>}
      {error && <p className="home__status home__status--error">{error}</p>}

      {!loading && (hasContent || !error) && (
        <>
          {gridItems.length > 0 && (
            <section className="home__grid-section" aria-label="Recently played">
              <div className="home__grid">
                {gridItems.map((item) => (
                  <HomeGridCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {playlists.length > 0 && (
            <section className="home__playlists-section" aria-label="Your playlists">
              <h2 className="home__section-title">Your Playlists</h2>
              <div className="home__playlist-scroll">
                {playlists.map((playlist) => (
                  <PlaylistScrollCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
