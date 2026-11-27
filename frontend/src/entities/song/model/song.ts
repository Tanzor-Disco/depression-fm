export interface Song {
  id: number
  spotifyId: string
  title: string
  artist: string
  imageUrl: string | null
  spotifyUrl: string
  description: string
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function imageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  try {
    const url = new URL(value)
    return ["http:", "https:"].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

// TypeScript types alone cannot validate JSON from the network.
export function parseSong(value: unknown): Song | null {
  if (typeof value !== "object" || value === null) return null
  const data = value as Record<string, unknown>
  if (
    typeof data.id !== "number" ||
    !Number.isInteger(data.id) ||
    !nonEmptyString(data.spotify_id) ||
    !/^[a-zA-Z0-9]{22}$/.test(data.spotify_id) ||
    !nonEmptyString(data.title) ||
    !nonEmptyString(data.artist) ||
    !nonEmptyString(data.description)
  ) {
    return null
  }

  return {
    id: data.id,
    spotifyId: data.spotify_id,
    title: data.title.trim(),
    artist: data.artist.trim(),
    imageUrl: imageUrl(data.image_url),
    // Canonical link avoids opening an arbitrary URL from the API.
    spotifyUrl: `https://open.spotify.com/track/${data.spotify_id}`,
    description: data.description.trim(),
  }
}
