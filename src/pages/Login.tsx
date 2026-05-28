import { useState } from 'react'
import logo from '../assets/logo.svg'
import { redirectToSpotifyLogin } from '../utils/spotifyAuth'
import './login.css'

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
    <main className="login">
      <img src={logo} alt="Evil Spotify" className="login__logo" width={64} height={64} />
      <button
        type="button"
        className="login__button"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'Redirecting…' : 'Log in with Spotify'}
      </button>
      {error && <p className="login__error">{error}</p>}
    </main>
  )
}
