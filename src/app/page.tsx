'use client'

import ChatBox from '@/components/Chatbox'
import Sidebar from '@/components/Sidebar'

export default function HomePage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ChatBox />
    </div>
  )
}
