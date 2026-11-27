import { useEffect, useRef, useState } from "react"
import type { Song } from "../../../entities/song/model/song"
import { ApiError, type ApiErrorKind } from "../../../shared/api/client"
import { getRandomSong } from "../api/get-random-song"

export function useRandomSong() {
  const [song, setSong] = useState<Song | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiErrorKind | null>(null)
  const request = useRef<AbortController | null>(null)
  const [discovery, setDiscovery] = useState(0)

  useEffect(() => () => request.current?.abort(), [])

  async function discover() {
    // Guard before React has committed the button's disabled state.
    if (request.current) return
    const controller = new AbortController()
    request.current = controller
    setIsLoading(true)
    setError(null)
    try {
      const nextSong = await getRandomSong(controller.signal)
      if (!controller.signal.aborted) {
        setSong(nextSong)
        setDiscovery((value) => value + 1)
      }
    } catch (failure) {
      if (!controller.signal.aborted) {
        setError(failure instanceof ApiError ? failure.kind : "network")
      }
    } finally {
      if (!controller.signal.aborted) {
        request.current = null
        setIsLoading(false)
      }
    }
  }

  return { song, isLoading, error, discovery, discover }
}
