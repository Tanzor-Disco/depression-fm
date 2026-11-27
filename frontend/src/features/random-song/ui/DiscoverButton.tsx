import { Icon } from "../../../shared/ui/Icon"
import "./DiscoverButton.css"

interface DiscoverButtonProps {
  isLoading: boolean
  hasSong: boolean
  hasError: boolean
  onClick: () => void
}

export function DiscoverButton({ isLoading, hasSong, hasError, onClick }: DiscoverButtonProps) {
  return (
    <button
      className="discover-button"
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-controls="discovery-result"
      aria-describedby={hasError ? "discovery-error" : undefined}
    >
      <Icon name="shuffle" className={isLoading ? "searching" : undefined} />
      <span>
        {isLoading
          ? "Ищем твой трек…"
          : hasError
            ? "Попробовать ещё раз"
            : hasSong
              ? "Ещё один трек"
              : "Найти свой трек"}
      </span>
    </button>
  )
}
