'use client'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <button
      onClick={() => setDark(!dark)}
      className="text-xs text-gray-500 dark:text-gray-300 hover:underline self-start"
    >
      {dark ? '☀ Light Mode' : '🌙 Dark Mode'}
    </button>
  )
}
