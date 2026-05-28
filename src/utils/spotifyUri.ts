import type { SpotifyPlayContext } from './spotify'

/** Extracts the resource ID from a Spotify URI (`spotify:type:id`). */
export function spotifyIdFromUri(uri: string): string | null {
  const id = uri.split(':').pop()
  return id && id.length > 0 ? id : null
}

export function routeFromPlayContext(context: SpotifyPlayContext): string | null {
  const id = spotifyIdFromUri(context.uri)
  if (!id) return null

  switch (context.type) {
    case 'playlist':
      return `/playlist/${id}`
    case 'album':
      return `/album/${id}`
    case 'artist':
      return `/artist/${id}`
    default:
      return null
  }
}
