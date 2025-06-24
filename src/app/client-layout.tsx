'use client'

import { useEffect, useState } from 'react'
import ContextProvider from '@/context/ContextProvider'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <ContextProvider>
      <div
        className="w-full h-full min-h-full rounded-xl shadow-xl border border-gray-300 overflow-hidden flex flex-col bg-white dark:bg-[#1a1a1a]"

      >
        {children}
      </div>
    </ContextProvider>
  )
}
