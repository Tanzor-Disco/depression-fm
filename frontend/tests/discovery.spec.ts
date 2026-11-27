import { expect, test } from "@playwright/test"

const song = {
  id: 1,
  spotify_id: "1234567890abcdefghijkl",
  title: "Искала",
  artist: "Земфира",
  description:
    "Когда город уже уснул, а мысли всё ещё идут по кругу. Песня для долгой дороги к себе.",
  image_url: "http://127.0.0.1:5173/src/assets/industrial-city.webp",
  spotify_url: "https://open.spotify.com/track/1234567890abcdefghijkl",
}

test("waits for a click, prevents duplicate requests, and displays the response", async ({
  page,
}) => {
  let requests = 0
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route("**/api/songs/random", async (route) => {
    requests++
    await pending
    await route.fulfill({ json: song })
  })
  await page.goto("/")
  await expect(page.getByRole("button", { name: "Найти свой трек" })).toBeVisible()
  expect(requests).toBe(0)
  await page.screenshot({ path: "test-results/desktop-initial.png", fullPage: true })

  // Two programmatic clicks in the same event loop exercise the synchronous guard.
  await page.getByRole("button").evaluate((button: HTMLButtonElement) => {
    button.click()
    button.click()
  })
  await expect(page.getByRole("button", { name: "Ищем твой трек…" })).toBeDisabled()
  await expect.poll(() => requests).toBe(1)
  release()
  await expect(page.getByRole("heading", { level: 2, name: song.title })).toBeVisible()
  await expect(page.getByText(song.description, { exact: true })).toBeVisible()
  await expect(page.getByRole("link", { name: /Слушать в Spotify/ })).toHaveAttribute(
    "href",
    song.spotify_url,
  )
  await expect(page.getByRole("button", { name: "Ещё один трек" })).toBeEnabled()
  await expect(page.getByRole("img", { name: /Обложка трека/ })).toBeVisible()
  await page.screenshot({ path: "test-results/desktop-result.png", fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: "test-results/mobile-result.png", fullPage: true })
})

test("gets another song and retains the current one when a subsequent request fails", async ({
  page,
}) => {
  let requests = 0
  await page.route("**/api/songs/random", (route) => {
    requests++
    return requests < 3
      ? route.fulfill({ json: { ...song, title: requests === 1 ? "Искала" : "Следующий трек" } })
      : route.fulfill({ status: 503 })
  })
  await page.goto("/")
  await page.getByRole("button", { name: "Найти свой трек" }).click()
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("Искала")
  await page.getByRole("button", { name: "Ещё один трек" }).click()
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("Следующий трек")
  await page.getByRole("button", { name: "Ещё один трек" }).click()
  await expect(page.getByRole("alert")).toContainText("Предыдущий трек всё ещё здесь.")
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("Следующий трек")
})

for (const scenario of ["empty", "server", "network", "invalid-json", "invalid-song"] as const) {
  test(`recovers after ${scenario}`, async ({ page }) => {
    let attempts = 0
    await page.route("**/api/songs/random", (route) => {
      if (++attempts > 1) return route.fulfill({ json: song })
      if (scenario === "network") return route.abort("failed")
      if (scenario === "empty") return route.fulfill({ status: 404 })
      if (scenario === "server") return route.fulfill({ status: 500 })
      if (scenario === "invalid-json")
        return route.fulfill({ contentType: "text/html", body: "<html>not json</html>" })
      return route.fulfill({ json: { ...song, title: null } })
    })
    await page.goto("/")
    await page.getByRole("button", { name: "Найти свой трек" }).click()
    await expect(page.getByRole("alert")).toBeVisible()
    if (scenario === "empty") await expect(page.getByRole("alert")).toContainText("нет треков")
    await page.getByRole("button", { name: "Попробовать ещё раз" }).click()
    await expect(page.getByRole("heading", { level: 2, name: song.title })).toBeVisible()
    await expect(page.getByRole("alert")).toHaveCount(0)
  })
}

test("times out a stalled request and allows a retry", async ({ page }) => {
  await page.route("**/api/songs/random", () => {
    /* Simulate a stalled upstream. */
  })
  await page.goto("/")
  await page.getByRole("button", { name: "Найти свой трек" }).click()
  await expect(page.getByRole("alert")).toContainText("Сигнал задерживается", { timeout: 15_000 })
  await expect(page.getByRole("button", { name: "Попробовать ещё раз" })).toBeEnabled()
})

test("uses the sleeve fallback for broken art and a canonical Spotify link", async ({ page }) => {
  await page.route("**/missing-cover.jpg", (route) => route.fulfill({ status: 404 }))
  await page.route("**/api/songs/random", (route) =>
    route.fulfill({
      json: {
        ...song,
        image_url: "http://127.0.0.1:5173/missing-cover.jpg",
        spotify_url: "javascript:alert('unsafe')",
      },
    }),
  )
  await page.goto("/")
  await page.getByRole("button", { name: "Найти свой трек" }).click()
  await expect(page.getByRole("img", { name: "Обложка недоступна" })).toBeVisible()
  await expect(page.getByRole("link", { name: /Слушать в Spotify/ })).toHaveAttribute(
    "href",
    song.spotify_url,
  )
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(song.title)
})

test("supports keyboard activation", async ({ page }) => {
  await page.route("**/api/songs/random", (route) => route.fulfill({ json: song }))
  await page.goto("/")
  await page.keyboard.press("Tab")
  await page.keyboard.press("Tab")
  await expect(page.getByRole("button", { name: "Найти свой трек" })).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(song.title)
})

test("fits narrow and wide screens, including long track text", async ({ page }) => {
  await page.route("**/api/songs/random", (route) =>
    route.fulfill({
      json: {
        ...song,
        title: "ОченьДлинноеНазваниеБезПробелов".repeat(5),
        artist: "Исполнитель с длинным именем".repeat(4),
        description: song.description.repeat(5),
      },
    }),
  )
  await page.goto("/")
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    )
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: "test-results/mobile-initial.png", fullPage: true })
  await page.getByRole("button", { name: "Найти свой трек" }).click()
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible()
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    )
  }
})
