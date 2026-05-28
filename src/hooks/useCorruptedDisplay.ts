import {
  CORRUPTED_ALBUM_NAME,
  CORRUPTED_ARTIST_NAME,
  CORRUPTED_COVER_SRC,
  CORRUPTED_PAGE_HEADING,
  CORRUPTED_SIDEBAR_PLAYLIST_NAME,
  CORRUPTED_TRACK_DURATION,
  CORRUPTED_TRACK_NAME,
} from '../constants/corruption'
import { useCorruption } from '../context/CorruptionContext'
import { formatDuration } from '../utils/format'

export function useCorruptedDisplay() {
  const { isCorrupted } = useCorruption()

  return {
    isCorrupted,
    playlistImage: (url: string | null | undefined) =>
      isCorrupted ? CORRUPTED_COVER_SRC : url ?? null,
    trackName: (name: string) => (isCorrupted ? CORRUPTED_TRACK_NAME : name),
    artistLabel: (formatted: string) => (isCorrupted ? CORRUPTED_ARTIST_NAME : formatted),
    trackDuration: (durationMs: number) =>
      isCorrupted ? CORRUPTED_TRACK_DURATION : formatDuration(durationMs),
    albumName: (name: string) => (isCorrupted ? CORRUPTED_ALBUM_NAME : name),
    /** Sidebar playlist list only */
    playlistName: (name: string) =>
      isCorrupted ? CORRUPTED_SIDEBAR_PLAYLIST_NAME : name,
    /** Main content hero h1 (playlist / album pages) */
    heroTitle: (name: string) => (isCorrupted ? CORRUPTED_PAGE_HEADING : name),
  }
}
