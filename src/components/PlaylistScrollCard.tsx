import { Link } from 'react-router-dom'
import type { SpotifyPlaylist } from '../utils/spotify'
import { PlayButton } from './PlayButton'
import './playlist-scroll-card.css'

interface PlaylistScrollCardProps {
  playlist: SpotifyPlaylist
}

export function PlaylistScrollCard({ playlist }: PlaylistScrollCardProps) {
  const imageUrl = playlist.images[0]?.url
  const description =
    playlist.description?.trim() ||
    `Playlist • ${playlist.owner.display_name ?? playlist.owner.id}`

  return (
    <Link to={`/playlist/${playlist.id}`} className="playlist-scroll-card">
      <div className="playlist-scroll-card__media">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="playlist-scroll-card__img" />
        ) : (
          <span className="playlist-scroll-card__img playlist-scroll-card__img--placeholder" />
        )}
        <PlayButton
          size="lg"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        />
      </div>
      <span className="playlist-scroll-card__name">{playlist.name}</span>
      <span className="playlist-scroll-card__desc">{description}</span>
    </Link>
  )
}
