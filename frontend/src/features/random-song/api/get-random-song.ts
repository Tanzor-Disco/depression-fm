import { parseSong, type Song } from "../../../entities/song/model/song"
import { ApiError, getJson } from "../../../shared/api/client"

export async function getRandomSong(signal: AbortSignal): Promise<Song> {
  const song = parseSong(await getJson("/songs/random", signal))
  if (!song) throw new ApiError("invalid")
  return song
}
