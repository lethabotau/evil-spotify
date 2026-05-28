import axios from 'axios'
import { getAccessToken } from './spotifyAuth'

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

export interface SpotifyPlaylistTracksRef {
  href: string
  total: number
}

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
  tracks: SpotifyPlaylistTracksRef
  type: 'playlist'
  uri: string
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

// --- API ---

export async function getCurrentUserProfile(): Promise<SpotifyUser> {
  const { data } = await spotify.get<SpotifyUser>('/me')
  return data
}

export async function getRecentlyPlayedTracks(
  limit = 20,
): Promise<SpotifyRecentlyPlayedResponse> {
  const { data } = await spotify.get<SpotifyRecentlyPlayedResponse>(
    '/me/player/recently-played',
    { params: { limit } },
  )
  return data
}

export async function getUserPlaylists(limit = 10): Promise<SpotifyUserPlaylistsResponse> {
  const { data } = await spotify.get<SpotifyUserPlaylistsResponse>('/me/playlists', {
    params: { limit },
  })
  return data
}

export async function getLikedSongs(limit = 20): Promise<SpotifySavedTracksResponse> {
  const { data } = await spotify.get<SpotifySavedTracksResponse>('/me/tracks', {
    params: { limit },
  })
  return data
}

export async function getPlaylistTracks(
  playlistId: string,
  limit = 100,
): Promise<SpotifyPlaylistTracksResponse> {
  const { data } = await spotify.get<SpotifyPlaylistTracksResponse>(
    `/playlists/${playlistId}/tracks`,
    { params: { limit } },
  )
  return data
}
