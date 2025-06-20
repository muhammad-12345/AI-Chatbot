'use client'

import { SquarePen } from 'lucide-react'
import { useChatContext } from '@/context/ContextProvider'

export default function Sidebar() {
  const { newChat, previousPrompt, onSent } = useChatContext()

  return (
    <aside className="w-64 h-screen bg-[#e2e2e2] dark:bg-[#1a1919] border-r dark:border-gray-800 p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-700 dark:text-white mb-6">My Chats</h2>

        <button
          onClick={newChat}
          className="w-full flex items-center justify-between bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg transition mb-4"
        >
          <div className="flex items-center gap-2">
            <SquarePen size={16} />
            <span>New chat</span>
          </div>
        </button>

        <ul className="space-y-2">
          {previousPrompt.length === 0 ? (
            <li className="text-sm text-gray-500">No previous chats</li>
          ) : (
            previousPrompt.map((prompt, index) => (
              <li
                key={index}
                onClick={() => onSent(prompt)} // ✅ Load this prompt in chat
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              >
                {prompt.length > 30 ? prompt.slice(0, 30) + '...' : prompt}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="text-sm text-gray-500 mt-6">© 2025 AI Chatbot</div>
    </aside>
  )
}
