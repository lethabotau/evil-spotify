import './playback-bar.css'

export function PlaybackBar() {
  return (
    <footer className="playback-bar" aria-label="Player">
      <div className="playback-bar__now-playing">
        <div className="playback-bar__art playback-bar__art--empty" />
        <div className="playback-bar__track">
          <span className="playback-bar__title">Not playing</span>
          <span className="playback-bar__artist">—</span>
        </div>
      </div>

      <div className="playback-bar__controls">
        <div className="playback-bar__buttons">
          <button type="button" className="playback-bar__btn" aria-label="Shuffle" disabled>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-.6.8H4.5a.75.75 0 0 0 0 1.5h2.325a.75.75 0 0 0 .61-.316l1.013-1.35A2.25 2.25 0 0 1 11.16 4.5h1.95l-1.017 1.018a.75.75 0 1 0 1.06 1.06L15.98 3.75V6a.75.75 0 0 0 1.5 0V1.5a.75.75 0 0 0-.922-.728l.001.001zM2.5 13.5a.75.75 0 0 0 1.06 0L4.576 12.54 6.525 14.5H8.25a.75.75 0 0 0 0-1.5H6.525a2.25 2.25 0 0 1-1.732-.804l-.6-.8H4.5a.75.75 0 0 0 0 1.5h1.325a.75.75 0 0 0 .61.316l1.013 1.35A2.25 2.25 0 0 0 8.25 14.5h1.95l-1.017-1.018a.75.75 0 1 0-1.06-1.06L2.02 14.25V12a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-2.25l.48.48z"
              />
            </svg>
          </button>
          <button type="button" className="playback-bar__btn" aria-label="Previous" disabled>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="playback-bar__btn playback-bar__btn--play"
            aria-label="Play"
            disabled
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"
              />
            </svg>
          </button>
          <button type="button" className="playback-bar__btn" aria-label="Next" disabled>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"
              />
            </svg>
          </button>
          <button type="button" className="playback-bar__btn" aria-label="Repeat" disabled>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12.25H12.25a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.75 4.75v1.5a.75.75 0 0 1-1.5 0v-1.5z"
              />
            </svg>
          </button>
        </div>
        <div className="playback-bar__progress">
          <span className="playback-bar__time">0:00</span>
          <div className="playback-bar__progress-track">
            <div className="playback-bar__progress-fill" style={{ width: '0%' }} />
          </div>
          <span className="playback-bar__time">0:00</span>
        </div>
      </div>

      <div className="playback-bar__extras">
        <button type="button" className="playback-bar__btn" aria-label="Volume" disabled>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M9.741.85a.75.75 0 0 1 .986.036l3.478 3.478a.75.75 0 0 1-.036 1.04l-3.478 3.478a.75.75 0 0 1-1.04-.036l-2.5-2.5H2.75A1.75 1.75 0 0 1 1 7.25v-1.5A1.75 1.75 0 0 1 2.75 4h4.475l2.516-2.65zM12.5 8a4.5 4.5 0 0 0-1.59-3.414l-.536.536A3 3 0 0 1 13.5 8c0 .83-.336 1.58-.878 2.122l.536.536A4.5 4.5 0 0 0 12.5 8z"
            />
          </svg>
        </button>
        <div className="playback-bar__volume">
          <div className="playback-bar__volume-fill" style={{ width: '70%' }} />
        </div>
      </div>
    </footer>
  )
}
