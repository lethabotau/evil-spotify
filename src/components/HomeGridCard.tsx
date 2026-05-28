import { Link, useNavigate } from 'react-router-dom'
import type { HomeGridItem } from '../utils/homeData'
import './home-grid-card.css'
import './play-button.css'

interface HomeGridCardProps {
  item: HomeGridItem
}

export function HomeGridCard({ item }: HomeGridCardProps) {
  const navigate = useNavigate()

  const inner = (
    <>
      {item.imageUrl ? (
        <img src={item.imageUrl} alt="" className="home-grid-card__img" />
      ) : (
        <span className="home-grid-card__img home-grid-card__img--placeholder" />
      )}
      <span className="home-grid-card__name">{item.name}</span>
      {item.route && (
        <button
          type="button"
          className="play-button play-button--sm"
          aria-label={`Play ${item.name}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            navigate(item.route!)
          }}
        />
      )}
    </>
  )

  if (item.route) {
    return (
      <Link to={item.route} className="home-grid-card">
        {inner}
      </Link>
    )
  }

  return <div className="home-grid-card">{inner}</div>
}
