import { useEffect, useState } from 'react'

const KEY = 'calorie-tracker:theme'

export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    // Colours the phone's status bar to match when installed as an app.
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#020617' : '#f8fafc')
    try {
      localStorage.setItem(KEY, dark ? 'dark' : 'light')
    } catch {
      // ignore
    }
  }, [dark])

  return [dark, () => setDark((d) => !d)]
}
