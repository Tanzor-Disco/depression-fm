export type ApiErrorKind = "empty" | "network" | "timeout" | "invalid" | "server"

export class ApiError extends Error {
  readonly kind: ApiErrorKind

  constructor(kind: ApiErrorKind) {
    super(kind)
    this.name = "ApiError"
    this.kind = kind
  }
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "")

export async function getJson(path: string, signal: AbortSignal): Promise<unknown> {
  const timeout = AbortSignal.timeout(12_000)
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      signal: AbortSignal.any([signal, timeout]),
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    if (response.status === 404) throw new ApiError("empty")
    if (!response.ok) throw new ApiError("server")
    try {
      return await response.json()
    } catch (error) {
      if (signal.aborted || timeout.aborted) throw error
      throw new ApiError("invalid")
    }
  } catch (error) {
    if (signal.aborted) throw error
    if (timeout.aborted) throw new ApiError("timeout")
    if (error instanceof ApiError) throw error
    throw new ApiError("network")
  }
}
