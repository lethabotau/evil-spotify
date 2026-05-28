import { useEffect, useState } from 'react'
import { HomeGridCard } from '../components/HomeGridCard'
import { PlaylistScrollCard } from '../components/PlaylistScrollCard'
import { buildRecentGridItems, type HomeGridItem } from '../utils/homeData'
import {
  getRecentlyPlayedTracks,
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

    Promise.all([getRecentlyPlayedTracks(50), getUserPlaylists(50)])
      .then(([recent, playlistData]) => {
        if (cancelled) return
        setGridItems(buildRecentGridItems(recent, playlistData.items))
        setPlaylists(playlistData.items)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load home feed')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="home">
      {loading && <p className="home__status">Loading…</p>}
      {error && <p className="home__status home__status--error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="home__grid-section" aria-label="Recently played">
            <div className="home__grid">
              {gridItems.map((item) => (
                <HomeGridCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          <section className="home__playlists-section" aria-label="Your playlists">
            <h2 className="home__section-title">Your Playlists</h2>
            <div className="home__playlist-scroll">
              {playlists.map((playlist) => (
                <PlaylistScrollCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
