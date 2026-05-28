import { generateCodeChallenge, generateCodeVerifier } from './pkce'

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'

export const ACCESS_TOKEN_KEY = 'spotify_access_token'
export const PKCE_VERIFIER_KEY = 'spotify_pkce_verifier'
export const OAUTH_STATE_KEY = 'spotify_oauth_state'

export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
].join(' ')

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

function getSpotifyClientId(): string {
  const value = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  if (!value) {
    throw new Error('Missing VITE_SPOTIFY_CLIENT_ID in environment')
  }
  return value
}

function getRedirectUri(): string {
  const value = import.meta.env.VITE_REDIRECT_URI
  if (!value) {
    throw new Error('Missing VITE_REDIRECT_URI in environment')
  }
  return value
}

export async function redirectToSpotifyLogin(): Promise<void> {
  const clientId = getSpotifyClientId()
  const redirectUri = getRedirectUri()

  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  const state = generateCodeVerifier()

  localStorage.setItem(PKCE_VERIFIER_KEY, verifier)
  localStorage.setItem(OAUTH_STATE_KEY, state)

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
  })

  window.location.assign(`${SPOTIFY_AUTH_URL}?${params.toString()}`)
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const clientId = getSpotifyClientId()
  const redirectUri = getRedirectUri()
  const verifier = localStorage.getItem(PKCE_VERIFIER_KEY)

  if (!verifier) {
    throw new Error('PKCE verifier not found; restart login')
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  })

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      error?: string
      error_description?: string
    } | null
    throw new Error(
      error?.error_description ?? error?.error ?? 'Failed to exchange authorization code',
    )
  }

  const data = (await response.json()) as { access_token: string }

  setAccessToken(data.access_token)
  localStorage.removeItem(PKCE_VERIFIER_KEY)
  localStorage.removeItem(OAUTH_STATE_KEY)

  return data.access_token
}

export function validateOAuthState(state: string): boolean {
  const stored = localStorage.getItem(OAUTH_STATE_KEY)
  return stored !== null && stored === state
}
