import { useState } from 'react'
import { redirectToSpotifyLogin } from '../utils/spotifyAuth'

export function Login() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError(null)
    try {
      await redirectToSpotifyLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start Spotify login')
      setLoading(false)
    }
  }

  return (
    <section className="login">
      <h1>Log in</h1>
      <button type="button" onClick={handleLogin} disabled={loading}>
        {loading ? 'Redirecting…' : 'Log in with Spotify'}
      </button>
      {error && <p className="error">{error}</p>}
    </section>
  )
}
