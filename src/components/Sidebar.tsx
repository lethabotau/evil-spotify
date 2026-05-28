import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.svg'
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.271 9.271 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm0 16.534a7.26 7.26 0 1 1 0-14.52 7.26 7.26 0 0 1 0 14.52z"
      />
    </svg>
  )
}

function LibraryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.5 2.134a1 1 0 0 1 1 0l6 3.464a1 1 0 0 1 .5.866V21a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V3a1 1 0 0 1 .5-.866zM16 4.732v14.536h4V6.041l-4-2.309zM4.5 2.134a1 1 0 0 1 1 0l6 3.464a1 1 0 0 1 .5.866V21a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V3a1 1 0 0 1 .5-.866zM6 4.732v14.536h4V6.041l-4-2.309z"
      />
    </svg>
  )
}

const navItems = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/search', label: 'Search', icon: SearchIcon },
  { to: '/library', label: 'Your Library', icon: LibraryIcon },
] as const

export function Sidebar() {
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
                  {playlist.images[0] ? (
                    <img
                      src={playlist.images[0].url}
                      alt=""
                      className="sidebar__playlist-img"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <span className="sidebar__playlist-img sidebar__playlist-img--placeholder" />
                  )}
                  <span className="sidebar__playlist-name">{playlist.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
