const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export default function Header({ userName, dark, onToggleTheme, onEditProfile, onSwitchUser }) {
  const iconBtn =
    'rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 ' +
    'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="h-8 w-8" />
          <span>
            calor<span className="font-extrabold text-emerald-500">EAT</span>
          </span>
        </h1>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onSwitchUser}
          className="mr-1 max-w-32 truncate rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={`Switch user (current: ${userName})`}
          title="Switch user"
        >
          {userName}
        </button>
        <button onClick={onEditProfile} className={iconBtn} aria-label="Edit profile" title="Edit profile">
          <svg {...iconProps}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
        </button>
        <button
          onClick={onToggleTheme}
          className={iconBtn}
          aria-label={dark ? 'Light theme' : 'Dark theme'}
          title={dark ? 'Light theme' : 'Dark theme'}
        >
          {dark ? (
            <svg {...iconProps}>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg {...iconProps}>
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
