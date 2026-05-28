import { Link } from 'react-router-dom'
import type { HomeGridItem } from '../utils/homeData'
import { PlayButton } from './PlayButton'
import './home-grid-card.css'

interface HomeGridCardProps {
  item: HomeGridItem
}

export function HomeGridCard({ item }: HomeGridCardProps) {
  const inner = (
    <>
      {item.imageUrl ? (
        <img src={item.imageUrl} alt="" className="home-grid-card__img" />
      ) : (
        <span className="home-grid-card__img home-grid-card__img--placeholder" />
      )}
      <span className="home-grid-card__name">{item.name}</span>
      <PlayButton
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      />
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
