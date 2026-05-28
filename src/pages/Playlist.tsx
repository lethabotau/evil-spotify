import { useParams } from 'react-router-dom'

export function Playlist() {
  const { id } = useParams<{ id: string }>()

  return (
    <div>
      <h1>Playlist</h1>
      <p className="text-secondary">ID: {id}</p>
    </div>
  )
}
