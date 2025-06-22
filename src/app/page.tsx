'use client'

import Chatbox from '@/components/Chatbox'
import Sidebar from '@/components/Sidebar'

export default function HomePage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <Chatbox />
    </div>
  )
}
