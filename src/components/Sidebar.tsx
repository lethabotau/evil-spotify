import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { CorruptedText } from './CorruptedText'
import { useCorruptedDisplay } from '../hooks/useCorruptedDisplay'
import { getUserPlaylists, type SpotifyPlaylist } from '../utils/spotify'
import './sidebar.css'

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33z"
      />
    </svg>
  )
}

const navItems = [{ to: '/', label: 'Home', icon: HomeIcon, end: true }] as const

export function Sidebar() {
  const { playlistImage, playlistName } = useCorruptedDisplay()
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getUserPlaylists(50)
      .then((data) => {
        if (!cancelled) {
          setPlaylists(data.items)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load playlists')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <NavLink to="/" className="sidebar__logo" aria-label="Home">
          <img src={logo} alt="" width={32} height={32} />
        </NavLink>

        <nav className="sidebar__nav" aria-label="Main">
          {navItems.map(({ to, label, icon: Icon, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar__nav-link${isActive ? ' sidebar__nav-link--active' : ''}`
              }
              {...rest}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar__playlists">
        <p className="sidebar__playlists-heading">Playlists</p>
        {loading && <p className="sidebar__playlists-status">Loading…</p>}
        {error && <p className="sidebar__playlists-status sidebar__playlists-status--error">{error}</p>}
        {!loading && !error && (
          <ul className="sidebar__playlist-list">
            {playlists.map((playlist) => (
              <li key={playlist.id}>
                <NavLink
                  to={`/playlist/${playlist.id}`}
                  className={({ isActive }) =>
                    `sidebar__playlist-link${isActive ? ' sidebar__playlist-link--active' : ''}`
                  }
                >
                  {playlistImage(playlist.images[0]?.url) ? (
                    <img
                      src={playlistImage(playlist.images[0]?.url)!}
                      alt=""
                      className="sidebar__playlist-img"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <span className="sidebar__playlist-img sidebar__playlist-img--placeholder" />
                  )}
                  <CorruptedText className="sidebar__playlist-name">
                    {playlistName(playlist.name)}
                  </CorruptedText>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
