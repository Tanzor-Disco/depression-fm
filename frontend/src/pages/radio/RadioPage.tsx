import { SongCard } from "../../entities/song/ui/SongCard"
import { useRandomSong } from "../../features/random-song/model/use-random-song"
import { DiscoverButton } from "../../features/random-song/ui/DiscoverButton"
import type { ApiErrorKind } from "../../shared/api/client"

const errors: Record<ApiErrorKind, string> = {
  empty: "Здесь пока тихо. В коллекции ещё нет треков. Загляни чуть позже.",
  network: "Сигнал потерялся. Проверь соединение и попробуй ещё раз.",
  timeout: "Сигнал задерживается. Попробуй поймать его ещё раз.",
  invalid: "Не получилось разобрать сигнал. Попробуй ещё раз чуть позже.",
  server: "На той стороне пока тишина. Попробуй ещё раз чуть позже.",
}

export function RadioPage() {
  const { song, isLoading, error, discovery, discover } = useRandomSong()
  return (
    <div className="radio-page">
      <div className="city-backdrop" aria-hidden="true" />
      <div className="paper-grain" aria-hidden="true" />
      <header className="site-header page-width">
        <a className="wordmark" href="./" aria-label="depression-fm — главная">
          depression<span className="wordmark__dash">—</span>fm
          <span className="wordmark__dot">.</span>
        </a>
        <span className="header-note">на одной волне с тобой</span>
      </header>
      <main className="radio-main page-width">
        <div className="intro">
          <p className="eyebrow">
            <span className="frequency-mark" aria-hidden="true" />
            музыка для внутренней погоды
          </p>
          <h1>
            у каждого
            <br />
            чувства есть
            <br />
            <span>свой звук.</span>
          </h1>
          <p className="intro__description">
            Для мыслей, которым тесно в тишине.
            <br />И чувств, для которых не хватает слов.
          </p>
          <div className="discovery-action">
            <DiscoverButton
              isLoading={isLoading}
              hasSong={!!song}
              hasError={!!error}
              onClick={discover}
            />
            <p className="discovery-hint">
              {song
                ? "может быть, следующая — именно та."
                : "нажми. вдруг это именно то, что нужно."}
            </p>
            {error && (
              <p className="discovery-error" id="discovery-error" role="alert">
                {errors[error]}
                {song && <span> Предыдущий трек всё ещё здесь.</span>}
              </p>
            )}
          </div>
        </div>
        <div id="discovery-result" className="discovery-result">
          <SongCard song={song} isLoading={isLoading} discovery={discovery} />
        </div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {isLoading
            ? "Ищем случайный трек."
            : song
              ? `Твой трек: ${song.title}. ${song.artist}. ${song.description}`
              : "Нажми «Найти свой трек», чтобы получить случайную песню."}
        </p>
      </main>
      <footer className="site-footer page-width">
        <span>случайные треки. настоящие чувства.</span>
        <span className="footer-signoff">
          побудь здесь <span aria-hidden="true">✳</span>
        </span>
      </footer>
    </div>
  )
}
