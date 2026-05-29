import { getRedirectUri, getSpotifyClientId } from '../config/env'
import { generateCodeChallenge, generateCodeVerifier } from './pkce'

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'

export const ACCESS_TOKEN_KEY = 'spotify_access_token'
export const PKCE_VERIFIER_KEY = 'spotify_pkce_verifier'
export const OAUTH_STATE_KEY = 'spotify_oauth_state'

export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-read-recently-played',
  'playlist-read-private',
  'playlist-read-collaborative',
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

/** Clears session and sends user to login (HashRouter). Used on API 401. */
export function logoutDueToUnauthorized(): void {
  clearAccessToken()
  localStorage.removeItem(PKCE_VERIFIER_KEY)
  localStorage.removeItem(OAUTH_STATE_KEY)

  const loginHash = '#/login'
  if (window.location.hash === loginHash) return

  window.location.replace(`${window.location.pathname}${loginHash}`)
}

/** Re-export for callers that need the exact URI sent to Spotify */
export { getRedirectUri } from '../config/env'

export function buildSpotifyAuthorizeUrl(
  clientId: string,
  redirectUri: string,
  challenge: string,
  state: string,
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
  })

  return `${SPOTIFY_AUTH_URL}?${params.toString()}`
}

export function readOAuthResponseFromLocation(): {
  code: string | null
  state: string | null
  error: string | null
} {
  const fromSearch = new URLSearchParams(window.location.search)
  if (fromSearch.has('code') || fromSearch.has('error') || fromSearch.has('state')) {
    return {
      code: fromSearch.get('code'),
      state: fromSearch.get('state'),
      error: fromSearch.get('error'),
    }
  }

  const hash = window.location.hash
  const queryStart = hash.indexOf('?')
  if (queryStart === -1) {
    return { code: null, state: null, error: null }
  }

  const fromHash = new URLSearchParams(hash.slice(queryStart + 1))
  return {
    code: fromHash.get('code'),
    state: fromHash.get('state'),
    error: fromHash.get('error'),
  }
}

export function hasOAuthResponseInUrl(): boolean {
  const { code, error } = readOAuthResponseFromLocation()
  return Boolean(code || error)
}

export function clearOAuthQueryFromUrl(): void {
  const path = window.location.pathname
  const hashPath = window.location.hash.split('?')[0]
  const nextHash = hashPath && hashPath !== '#' ? hashPath : '#/'
  window.history.replaceState(null, '', `${path}${nextHash}`)
}

export async function redirectToSpotifyLogin(): Promise<void> {
  const clientId = getSpotifyClientId()
  const redirectUri = getRedirectUri()

  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  const state = generateCodeVerifier()

  localStorage.setItem(PKCE_VERIFIER_KEY, verifier)
  localStorage.setItem(OAUTH_STATE_KEY, state)

  const authorizeUrl = buildSpotifyAuthorizeUrl(clientId, redirectUri, challenge, state)

  if (import.meta.env.DEV) {
    console.info('[spotify auth] redirect_uri sent to Spotify:', redirectUri)
  }

  window.location.assign(authorizeUrl)
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

export async function completeOAuthFromUrl(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const { code, state, error: oauthError } = readOAuthResponseFromLocation()

  if (oauthError) {
    clearOAuthQueryFromUrl()
    return { ok: false, error: oauthError }
  }

  if (!code || !state) {
    return { ok: false, error: 'Missing authorization response from Spotify' }
  }

  if (!validateOAuthState(state)) {
    clearOAuthQueryFromUrl()
    return { ok: false, error: 'Invalid OAuth state' }
  }

  try {
    await exchangeCodeForToken(code)
    clearOAuthQueryFromUrl()
    return { ok: true }
  } catch (err) {
    clearOAuthQueryFromUrl()
    throw err
  }
}
