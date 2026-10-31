import { useSyncExternalStore } from 'react'

// Chrome/Edge/Android fire `beforeinstallprompt` when the app can be installed. Keep the
// event so an in-app "Install" button can trigger the browser's install dialog later.
// Safari never fires it; there the user installs via Share → Add to Home Screen.
let deferred = null
const listeners = new Set()
const notify = () => listeners.forEach((l) => l())

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferred = e
  notify()
})
window.addEventListener('appinstalled', () => {
  deferred = null
  notify()
})

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Returns a function that opens the install dialog, or null when installing isn't available.
export function useInstallPrompt() {
  const event = useSyncExternalStore(subscribe, () => deferred)
  if (!event) return null
  return () => {
    deferred = null
    notify()
    event.prompt()
  }
}
