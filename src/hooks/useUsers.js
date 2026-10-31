import { useState } from 'react'
import { useLocalStorage } from './useLocalStorage'

const USERS_KEY = 'calorie-tracker:users'
const CURRENT_KEY = 'calorie-tracker:current-user'
const DATA_KEYS = ['profile', 'meals', 'favorites', 'goals', 'weights']

export const userKey = (id, name) => `calorie-tracker:u:${id}:${name}`

// Data saved before users existed lives under flat keys; move it into a first user.
function migrateLegacy() {
  try {
    if (localStorage.getItem(USERS_KEY) !== null) return
    const legacy = DATA_KEYS.filter((k) => localStorage.getItem(`calorie-tracker:${k}`) !== null)
    if (!legacy.length) return
    const id = crypto.randomUUID()
    for (const k of legacy) {
      localStorage.setItem(userKey(id, k), localStorage.getItem(`calorie-tracker:${k}`))
      localStorage.removeItem(`calorie-tracker:${k}`)
    }
    localStorage.setItem(USERS_KEY, JSON.stringify([{ id, name: 'User' }]))
    localStorage.setItem(CURRENT_KEY, JSON.stringify(id))
  } catch {
    // Storage blocked: nothing to migrate.
  }
}

export function useUsers() {
  useState(migrateLegacy)
  const [users, setUsers] = useLocalStorage(USERS_KEY, [])
  const [currentId, setCurrentId] = useLocalStorage(CURRENT_KEY, null)

  const current = users.find((u) => u.id === currentId) ?? null

  function addUser(name) {
    const user = { id: crypto.randomUUID(), name: name.trim() }
    setUsers((all) => [...all, user])
    setCurrentId(user.id)
  }

  function deleteUser(id) {
    try {
      for (const k of DATA_KEYS) localStorage.removeItem(userKey(id, k))
    } catch {
      // Storage blocked: only the in-memory list changes.
    }
    setUsers((all) => all.filter((u) => u.id !== id))
    if (id === currentId) setCurrentId(null)
  }

  return { users, current, addUser, deleteUser, selectUser: setCurrentId, signOut: () => setCurrentId(null) }
}
