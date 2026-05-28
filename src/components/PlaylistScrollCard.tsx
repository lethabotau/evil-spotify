import { Link, useNavigate } from 'react-router-dom'
import type { SpotifyPlaylist } from '../utils/spotify'
import './playlist-scroll-card.css'
import './play-button.css'

interface PlaylistScrollCardProps {
  playlist: SpotifyPlaylist
}

export function PlaylistScrollCard({ playlist }: PlaylistScrollCardProps) {
  const navigate = useNavigate()
  const playlistPath = `/playlist/${playlist.id}`
  const imageUrl = playlist.images[0]?.url
  const description =
    playlist.description?.trim() ||
    `Playlist • ${playlist.owner.display_name ?? playlist.owner.id}`

  return (
    <div className="playlist-scroll-card">
      <div className="playlist-scroll-card__media">
        <Link to={playlistPath} className="playlist-scroll-card__cover-link">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="playlist-scroll-card__img" />
          ) : (
            <span className="playlist-scroll-card__img playlist-scroll-card__img--placeholder" />
          )}
        </Link>
        <button
          type="button"
          className="play-button play-button--lg"
          aria-label={`Play ${playlist.name}`}
          onClick={() => navigate(playlistPath)}
        />
      </div>
      <Link to={playlistPath} className="playlist-scroll-card__meta">
        <span className="playlist-scroll-card__name">{playlist.name}</span>
        <span className="playlist-scroll-card__desc">{description}</span>
      </Link>
    </div>
  )
}
