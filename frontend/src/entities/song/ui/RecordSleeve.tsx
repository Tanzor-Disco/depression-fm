import { useState } from "react"
import type { Song } from "../model/song"

export function RecordSleeve({ song }: { song: Song | null }) {
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const hasImage = song?.imageUrl && failedImage !== song.imageUrl
  return (
    <div className="record-object">
      <div className="vinyl" aria-hidden="true">
        <div className="vinyl__label">
          <span>d.fm</span>
          <i />
          <small>сторона а</small>
        </div>
      </div>
      <div className={`record-sleeve ${hasImage ? "record-sleeve--cover" : ""}`}>
        {hasImage ? (
          <img
            src={song.imageUrl!}
            alt={`Обложка трека «${song.title}» — ${song.artist}`}
            onError={() => setFailedImage(song.imageUrl)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="sleeve-art"
            role="img"
            aria-label={
              song ? "Обложка недоступна" : "Конверт пластинки depression-fm: город в тумане"
            }
          >
            <div className="sleeve-art__heading">
              <span>depression-fm</span>
              <span>музыка внутри</span>
            </div>
            <span className="sleeve-art__mark">d.</span>
            <span className="sleeve-art__footer">
              {song ? "звук важнее картинки" : "настроиться на себя"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
