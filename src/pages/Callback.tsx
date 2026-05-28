import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeCodeForToken, validateOAuthState } from '../utils/spotifyAuth'

export function Callback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const handled = useRef(false)

  useEffect(() => {
    const oauthError = searchParams.get('error')
    if (oauthError) {
      setError(oauthError)
      return
    }

    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      setError('Missing authorization response from Spotify')
      return
    }

    if (!validateOAuthState(state)) {
      setError('Invalid OAuth state')
      return
    }

    if (handled.current) return
    handled.current = true

    exchangeCodeForToken(code)
      .then(() => navigate('/', { replace: true }))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Login failed')
      })
  }, [searchParams, navigate])

  if (error) {
    return (
      <section className="login">
        <p className="error">{error}</p>
      </section>
    )
  }

  return (
    <section className="login">
      <p>Completing login…</p>
    </section>
  )
}
