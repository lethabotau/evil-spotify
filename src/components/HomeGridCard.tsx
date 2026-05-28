import { Link, useNavigate } from 'react-router-dom'
import { useCorruptedDisplay } from '../hooks/useCorruptedDisplay'
import type { HomeGridItem } from '../utils/homeData'
import './home-grid-card.css'
import './play-button.css'

interface HomeGridCardProps {
  item: HomeGridItem
}

export function HomeGridCard({ item }: HomeGridCardProps) {
  const navigate = useNavigate()
  const { playlistImage, albumName, isCorrupted } = useCorruptedDisplay()
  const thumbSrc = isCorrupted ? playlistImage(item.imageUrl) : item.imageUrl
  const displayName = isCorrupted ? albumName(item.name) : item.name

  const inner = (
    <>
      {thumbSrc ? (
        <img src={thumbSrc} alt="" className="home-grid-card__img" />
      ) : (
        <span className="home-grid-card__img home-grid-card__img--placeholder" />
      )}
      <span className="home-grid-card__name">{displayName}</span>
      {item.route && (
        <button
          type="button"
          className="play-button play-button--sm"
          aria-label={`Play ${displayName}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            navigate(item.route!)
          }}
        />
      )}
    </>
  )

  if (!item.route) {
    return <div className="home-grid-card">{inner}</div>
  }

  return (
    <Link to={item.route} className="home-grid-card">
      {inner}
    </Link>
  )
}
