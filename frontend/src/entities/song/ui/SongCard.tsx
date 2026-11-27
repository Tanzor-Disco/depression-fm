import type { Song } from "../model/song"
import { Icon } from "../../../shared/ui/Icon"
import { RecordSleeve } from "./RecordSleeve"
import "./SongCard.css"

interface SongCardProps {
  song: Song | null
  isLoading: boolean
  discovery: number
}

export function SongCard({ song, isLoading, discovery }: SongCardProps) {
  return (
    <section
      className={`song-card ${isLoading ? "song-card--loading" : ""}`}
      aria-label="Твой трек"
      aria-busy={isLoading}
    >
      <div className="song-card__eyebrow">
        <span>
          {isLoading
            ? "ловим твою частоту"
            : song
              ? "случайность, которую стоит услышать"
              : "одна кнопка. одна песня."}
        </span>
        <Icon name="disc" className={isLoading ? "spinning" : undefined} />
      </div>
      <RecordSleeve song={song} />
      <div className="song-card__details" key={discovery}>
        {song ? (
          <>
            <p className="song-card__artist">{song.artist}</p>
            <h2 className="song-card__title">{song.title}</h2>
            <p className="song-card__description">{song.description}</p>
            <a
              className="spotify-link"
              href={song.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="spotify" />
              Слушать в Spotify<span className="sr-only"> (в новой вкладке)</span>
            </a>
          </>
        ) : (
          <div className="song-card__invitation">
            <span className="invitation-line" aria-hidden="true" />
            <p>Твой трек ещё не прозвучал.</p>
            <span>Позволь случайности выбрать.</span>
          </div>
        )}
      </div>
    </section>
  )
}
