import type {
  SpotifyPlaylist,
  SpotifyRecentlyPlayedResponse,
} from './spotify'
import { routeFromPlayContext, spotifyIdFromUri } from './spotifyUri'

export interface HomeGridItem {
  id: string
  name: string
  imageUrl: string | null
  route: string | null
}

export function buildRecentGridItems(
  recent: SpotifyRecentlyPlayedResponse,
  playlists: SpotifyPlaylist[],
  maxItems = 8,
): HomeGridItem[] {
  const playlistById = new Map(playlists.map((p) => [p.id, p]))
  const seen = new Set<string>()
  const items: HomeGridItem[] = []

  const pushItem = (item: HomeGridItem) => {
    if (seen.has(item.id)) return
    seen.add(item.id)
    items.push(item)
  }

  for (const { track, context } of recent.items) {
    if (items.length >= maxItems) break

    if (!context) {
      pushItem({
        id: `album-${track.album.id}`,
        name: track.album.name,
        imageUrl: track.album.images[0]?.url ?? null,
        route: `/album/${track.album.id}`,
      })
      continue
    }

    const route = routeFromPlayContext(context)
    if (!route) continue

    if (context.type === 'playlist') {
      const playlistId = spotifyIdFromUri(context.uri)
      if (!playlistId) continue
      const playlist = playlistById.get(playlistId)
      pushItem({
        id: `playlist-${playlistId}`,
        name: playlist?.name ?? track.name,
        imageUrl: playlist?.images[0]?.url ?? track.album.images[0]?.url ?? null,
        route,
      })
      continue
    }

    if (context.type === 'album') {
      const albumId = spotifyIdFromUri(context.uri)
      if (!albumId) continue
      pushItem({
        id: `album-${albumId}`,
        name: track.album.name,
        imageUrl: track.album.images[0]?.url ?? null,
        route,
      })
      continue
    }

    if (context.type === 'artist') {
      const artistId = spotifyIdFromUri(context.uri)
      if (!artistId) continue
      const artist = track.artists.find((a) => a.id === artistId) ?? track.artists[0]
      if (!artist) continue
      pushItem({
        id: `artist-${artistId}`,
        name: artist.name,
        imageUrl: track.album.images[0]?.url ?? null,
        route,
      })
    }
  }

  if (items.length < maxItems) {
    for (const playlist of playlists) {
      if (items.length >= maxItems) break
      pushItem({
        id: `playlist-${playlist.id}`,
        name: playlist.name,
        imageUrl: playlist.images[0]?.url ?? null,
        route: `/playlist/${playlist.id}`,
      })
    }
  }

  return items.slice(0, maxItems)
}
