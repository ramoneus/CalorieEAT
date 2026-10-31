import { useState } from 'react'
import { inputClass } from './Field'

export default function UserPicker({ users, onSelect, onAdd, onDelete }) {
  const [name, setName] = useState('')
  const valid = name.trim().length > 0

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return
    onAdd(name)
    setName('')
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900/60">
        <h1 className="text-xl font-semibold tracking-tight">
          calor<span className="font-extrabold text-emerald-500">EAT</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {users.length ? 'Choose a user to continue.' : 'Create the first user.'}
        </p>

        {users.length > 0 && (
          <ul className="mt-6 space-y-2">
            {users.map((u) => (
              <li key={u.id} className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(u.id)}
                  className="flex flex-1 items-center gap-3 rounded-lg border border-slate-300 px-3 py-2.5 text-left text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {u.name.charAt(0).toUpperCase()}
                  </span>
                  {u.name}
                </button>
                <button
                  type="button"
                  onClick={() => confirm(`Delete user “${u.name}” and all of their data?`) && onDelete(u.id)}
                  className="rounded-lg px-3 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  aria-label={`Delete user ${u.name}`}
                  title="Delete"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} className={`flex gap-2 ${users.length ? 'mt-6 border-t border-slate-200 pt-6 dark:border-slate-800' : 'mt-6'}`}>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New user name"
            maxLength={30}
            aria-label="New user name"
          />
          <button
            type="submit"
            disabled={!valid}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  )
}
