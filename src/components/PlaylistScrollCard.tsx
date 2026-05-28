import { Link } from 'react-router-dom'
import { useCorruptedDisplay } from '../hooks/useCorruptedDisplay'
import type { SpotifyPlaylist } from '../utils/spotify'
import './playlist-scroll-card.css'

interface PlaylistScrollCardProps {
  playlist: SpotifyPlaylist
}

export function PlaylistScrollCard({ playlist }: PlaylistScrollCardProps) {
  const playlistPath = `/playlist/${playlist.id}`
  const { playlistImage, albumName } = useCorruptedDisplay()
  const displayName = albumName(playlist.name)
  const imageUrl = playlistImage(playlist.images[0]?.url)
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
      </div>
      <Link to={playlistPath} className="playlist-scroll-card__meta">
        <span className="playlist-scroll-card__name">{displayName}</span>
        <span className="playlist-scroll-card__desc">{description}</span>
      </Link>
    </div>
  )
}
