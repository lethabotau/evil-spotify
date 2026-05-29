/**
 * Spotify OAuth redirect URI from Vite env (inlined at build time).
 * Fragments are stripped — Spotify does not accept `#` in redirect_uri.
 */
export function getRedirectUri(): string {
  const raw = import.meta.env.VITE_REDIRECT_URI?.trim()
  if (!raw) {
    throw new Error('Missing VITE_REDIRECT_URI in environment')
  }

  const hashIndex = raw.indexOf('#')
  const uri = hashIndex === -1 ? raw : raw.slice(0, hashIndex)

  if (!uri) {
    throw new Error('Invalid VITE_REDIRECT_URI in environment')
  }

  return uri
}

export function getSpotifyClientId(): string {
  const value = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim()
  if (!value) {
    throw new Error('Missing VITE_SPOTIFY_CLIENT_ID in environment')
  }
  return value
}
