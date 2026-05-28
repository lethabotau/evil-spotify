import { useParams } from 'react-router-dom'

export function Artist() {
  const { id } = useParams<{ id: string }>()

  return (
    <div>
      <h1>Artist</h1>
      {id && <p className="text-secondary">ID: {id}</p>}
    </div>
  )
}
