'use client'

import Sidebar from '@/components/Sidebar'
import ChatBox from '@/components/Chatbox'

export default function Home() {
  return (
    <main className="min-h-screen h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <ChatBox />
      </div>
    </main>
  )
}
