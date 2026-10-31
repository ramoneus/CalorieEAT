import { useEffect, useState } from 'react'

const KEY = 'calorie-tracker:theme'

export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem(KEY, dark ? 'dark' : 'light')
    } catch {
      // ignore
    }
  }, [dark])

  return [dark, () => setDark((d) => !d)]
}
