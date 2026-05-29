import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  completeOAuthFromUrl,
  hasOAuthResponseInUrl,
} from '../utils/spotifyAuth'

/**
 * Spotify returns ?code= on the document URL (before the hash).
 * HashRouter does not route that to #/callback, so we handle it here.
 */
export function OAuthCallbackHandler() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const handled = useRef(false)

  useEffect(() => {
    if (!hasOAuthResponseInUrl() || handled.current) return
    handled.current = true

    completeOAuthFromUrl()
      .then((result) => {
        if (result.ok) {
          navigate('/', { replace: true })
          return
        }
        if (result.error) setError(result.error)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Login failed')
      })
  }, [navigate])

  if (!error) return null

  return (
    <section className="login">
      <p className="login__error">{error}</p>
    </section>
  )
}
