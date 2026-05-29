import axios from 'axios'
import { getAccessToken, logoutDueToUnauthorized } from './spotifyAuth'

export class SpotifySessionExpiredError extends Error {
  constructor() {
    super('session_expired')
    this.name = 'SpotifySessionExpiredError'
  }
}

let isUnauthorizedLogoutInProgress = false

export const spotify = axios.create({
  baseURL: 'https://api.spotify.com/v1',
})

spotify.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

spotify.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !isUnauthorizedLogoutInProgress
    ) {
      isUnauthorizedLogoutInProgress = true
      clearSpotifyCache()
      logoutDueToUnauthorized()
      return Promise.reject(new SpotifySessionExpiredError())
    }
    return Promise.reject(error)
  },
)

export function isSessionExpiredError(err: unknown): err is SpotifySessionExpiredError {
  return err instanceof SpotifySessionExpiredError
}

const CACHE_TTL_MS = 5 * 60 * 1000

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const responseCache = new Map<string, CacheEntry<unknown>>()
const inflightRequests = new Map<string, Promise<unknown>>()

/** In-memory cache (5 min) + in-flight deduplication for identical keys */
function cachedRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const cached = responseCache.get(key) as CacheEntry<T> | undefined
  if (cached && cached.expiresAt > now) {
    return Promise.resolve(cached.value)
  }

  const inflight = inflightRequests.get(key) as Promise<T> | undefined
  if (inflight) return inflight

  const promise = request()
    .then((value) => {
      responseCache.set(key, { value, expiresAt: now + CACHE_TTL_MS })
      inflightRequests.delete(key)
      return value
    })
    .catch((err) => {
      inflightRequests.delete(key)
      throw err
    })

  inflightRequests.set(key, promise)
  return promise
}

export function clearSpotifyCache(): void {
  responseCache.clear()
  inflightRequests.clear()
}

// --- Shared ---

export interface SpotifyExternalUrls {
  spotify: string
}

export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyFollowers {
  href: string | null
  total: number
}

export interface SpotifyArtist {
  external_urls: SpotifyExternalUrls
  href: string
  id: string
  name: string
  type: 'artist'
  uri: string
}

export interface SpotifyAlbum {
  album_type: 'album' | 'single' | 'compilation'
  artists: SpotifyArtist[]
  available_markets: string[]
  external_urls: SpotifyExternalUrls
  href: string
  id: string
  images: SpotifyImage[]
  name: string
  release_date: string
  release_date_precision: 'year' | 'month' | 'day'
  total_tracks: number
  type: 'album'
  uri: string
}

export interface SpotifyTrack {
  album: SpotifyAlbum
  artists: SpotifyArtist[]
  available_markets: string[]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_urls: SpotifyExternalUrls
  href: string
  id: string
  is_local: boolean
  name: string
  popularity: number
  preview_url: string | null
  track_number: number
  type: 'track'
  uri: string
}

export interface SpotifyUser {
  display_name: string | null
  external_urls: SpotifyExternalUrls
  followers: SpotifyFollowers
  href: string
  id: string
  images: SpotifyImage[]
  type: 'user'
  uri: string
  country?: string
  email?: string
  product?: string
}

export interface SpotifyPaging<T> {
  href: string
  limit: number
  next: string | null
  offset: number
  previous: string | null
  total: number
  items: T[]
}

export interface SpotifyPlaylistOwner {
  external_urls: SpotifyExternalUrls
  href: string
  id: string
  type: 'user'
  uri: string
  display_name: string | null
}

export interface SpotifyPlaylistItemsRef {
  href: string
  total: number
}

/** @deprecated Spotify renamed this to `items` (Feb 2026) */
export type SpotifyPlaylistTracksRef = SpotifyPlaylistItemsRef

export interface SpotifyPlaylist {
  collaborative: boolean
  description: string | null
  external_urls: SpotifyExternalUrls
  followers: SpotifyFollowers
  href: string
  id: string
  images: SpotifyImage[]
  name: string
  owner: SpotifyPlaylistOwner
  public: boolean | null
  snapshot_id: string
  items?: SpotifyPlaylistItemsRef
  /** @deprecated Use `items` */
  tracks?: SpotifyPlaylistItemsRef
  type: 'playlist'
  uri: string
}

export function getPlaylistItemCount(playlist: SpotifyPlaylist): number {
  return playlist.items?.total ?? playlist.tracks?.total ?? 0
}

export interface SpotifyPlayContext {
  type: 'album' | 'artist' | 'playlist'
  href: string
  external_urls: SpotifyExternalUrls
  uri: string
}

export interface SpotifyRecentlyPlayedItem {
  track: SpotifyTrack
  played_at: string
  context: SpotifyPlayContext | null
}

export interface SpotifyRecentlyPlayedResponse {
  href: string
  limit: number
  next: string | null
  cursor: {
    after: string
    before: string
  }
  items: SpotifyRecentlyPlayedItem[]
}

export interface SpotifySavedTrackItem {
  added_at: string
  track: SpotifyTrack
}

export type SpotifySavedTracksResponse = SpotifyPaging<SpotifySavedTrackItem>

export type SpotifyUserPlaylistsResponse = SpotifyPaging<SpotifyPlaylist>

export interface SpotifyPlaylistTrackItem {
  added_at: string
  added_by: SpotifyPlaylistOwner
  is_local: boolean
  track: SpotifyTrack | null
}

export type SpotifyPlaylistTracksResponse = SpotifyPaging<SpotifyPlaylistTrackItem>

/** Raw shape from GET /playlists/{id}/items (Feb 2026+) */
interface SpotifyPlaylistItemApi {
  added_at: string
  added_by: SpotifyPlaylistOwner
  is_local: boolean
  item?: SpotifyTrack | null
  /** Present on deprecated /tracks responses */
  track?: SpotifyTrack | null
}

function normalizePlaylistItem(raw: SpotifyPlaylistItemApi): SpotifyPlaylistTrackItem {
  return {
    added_at: raw.added_at,
    added_by: raw.added_by,
    is_local: raw.is_local,
    track: raw.item ?? raw.track ?? null,
  }
}

export function getSpotifyErrorMessage(err: unknown): string {
  if (isSessionExpiredError(err)) {
    return ''
  }
  if (!axios.isAxiosError(err)) {
    return err instanceof Error ? err.message : 'Request failed'
  }
  if (err.response?.status === 401) {
    return ''
  }
  if (err.response?.status === 403) {
    return 'Tracks are only available for playlists you own or collaborate on. Spotify no longer allows loading tracks for other users’ playlists.'
  }
  if (err.response?.status === 429) {
    return 'Spotify rate limit reached. Wait a minute and refresh.'
  }
  const data = err.response?.data as { error?: { message?: string } } | undefined
  return data?.error?.message ?? 'Something went wrong loading from Spotify.'
}

// --- API ---

export async function getCurrentUserProfile(): Promise<SpotifyUser> {
  return cachedRequest('user-profile', async () => {
    const { data } = await spotify.get<SpotifyUser>('/me')
    return data
  })
}

export async function getRecentlyPlayedTracks(
  limit = 20,
): Promise<SpotifyRecentlyPlayedResponse> {
  return cachedRequest(`recently-played:${limit}`, async () => {
    const { data } = await spotify.get<SpotifyRecentlyPlayedResponse>(
      '/me/player/recently-played',
      { params: { limit } },
    )
    return data
  })
}

export async function getUserPlaylists(limit = 10): Promise<SpotifyUserPlaylistsResponse> {
  return cachedRequest(`playlists:${limit}`, async () => {
    const { data } = await spotify.get<SpotifyUserPlaylistsResponse>('/me/playlists', {
      params: { limit },
    })
    return data
  })
}

export async function getLikedSongs(limit = 20): Promise<SpotifySavedTracksResponse> {
  const { data } = await spotify.get<SpotifySavedTracksResponse>('/me/tracks', {
    params: { limit },
  })
  return data
}

export async function getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
  const { data } = await spotify.get<SpotifyPlaylist>(`/playlists/${playlistId}`)
  return data
}

export async function getPlaylistTracks(
  playlistId: string,
  limit = 50,
  offset = 0,
): Promise<SpotifyPlaylistTracksResponse> {
  return cachedRequest(`playlist-tracks:${playlistId}:${limit}:${offset}`, async () => {
    const { data } = await spotify.get<SpotifyPaging<SpotifyPlaylistItemApi>>(
      `/playlists/${playlistId}/items`,
      { params: { limit, offset, additional_types: 'track' } },
    )
    return {
      ...data,
      items: data.items.map(normalizePlaylistItem),
    }
  })
}

export async function getAllPlaylistTracks(
  playlistId: string,
): Promise<SpotifyPlaylistTrackItem[]> {
  return cachedRequest(`playlist-tracks-all:${playlistId}`, async () => {
    const items: SpotifyPlaylistTrackItem[] = []
    const limit = 50
    let offset = 0

    while (true) {
      const page = await getPlaylistTracks(playlistId, limit, offset)
      items.push(...page.items)
      if (!page.next) break
      offset += limit
    }

    return items
  })
}

export interface SpotifyAlbumTrackSimplified {
  artists: SpotifyArtist[]
  available_markets: string[]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_urls: SpotifyExternalUrls
  href: string
  id: string
  is_local: boolean
  name: string
  preview_url: string | null
  track_number: number
  type: 'track'
  uri: string
}

export type SpotifyAlbumTracksResponse = SpotifyPaging<SpotifyAlbumTrackSimplified>

export async function getAlbum(albumId: string): Promise<SpotifyAlbum> {
  const { data } = await spotify.get<SpotifyAlbum>(`/albums/${albumId}`)
  return data
}

export async function getAlbumTracks(
  albumId: string,
  limit = 50,
  offset = 0,
): Promise<SpotifyAlbumTracksResponse> {
  const { data } = await spotify.get<SpotifyAlbumTracksResponse>(
    `/albums/${albumId}/tracks`,
    { params: { limit, offset } },
  )
  return data
}

export async function getAllAlbumTracks(
  albumId: string,
): Promise<SpotifyAlbumTrackSimplified[]> {
  const items: SpotifyAlbumTrackSimplified[] = []
  const limit = 50
  let offset = 0

  while (true) {
    const page = await getAlbumTracks(albumId, limit, offset)
    items.push(...page.items)
    if (!page.next) break
    offset += limit
  }

  return items
}

