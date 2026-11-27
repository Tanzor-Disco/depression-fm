interface IconProps {
  name: "shuffle" | "spotify" | "disc"
  className?: string
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {name === "shuffle" && (
        <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h3c5 0 7 12 12 12h3M3 18h3c2 0 3.7-2.5 5-5M14 8c1.2-1.3 2.5-2 4-2h3" />
          <path d="m18 3 3 3-3 3m0 6 3 3-3 3" />
        </g>
      )}
      {name === "spotify" && (
        <>
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <g stroke="var(--paper)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6.5 9c3.9-1.2 7.6-.9 11 1M7 12c3.5-1 6.7-.7 9.7.9M7.8 15c2.7-.7 5.1-.5 7.7.7" />
          </g>
        </>
      )}
      {name === "disc" && (
        <g stroke="currentColor" strokeWidth="1.25">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2" />
          <path d="M12 6a6 6 0 0 0-6 6m12 0a6 6 0 0 1-6 6" />
        </g>
      )}
    </svg>
  )
}
