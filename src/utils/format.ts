export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatTotalDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours} hr ${minutes} min ${seconds} sec`
  }
  return `${minutes} min ${seconds} sec`
}

export function formatArtistNames(
  artists: { name: string }[],
): string {
  return artists.map((a) => a.name).join(', ')
}

export function releaseYear(releaseDate: string): string {
  return releaseDate.split('-')[0] ?? releaseDate
}
