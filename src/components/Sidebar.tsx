'use client'

import { useState } from 'react'
import { SquarePen, Menu, Brain } from 'lucide-react'
import { useChatContext } from '@/context/ContextProvider'

export default function Sidebar() {
  const { newChat, previousPrompt, onSent, setInput } = useChatContext()
  const [collapsed, setCollapsed] = useState(false)

  // 🟦 prevent adding this to chat history
  const handlePromptClick = async (prompt: string) => {
  setInput(prompt)
  await onSent(prompt, false, undefined, true) // ✅ prevent re-adding prompt to history
}


  return (
    <aside
      className={`h-screen bg-[#e2e2e2] dark:bg-[#1a1919] border-r dark:border-gray-800 p-4 flex flex-col justify-between transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
    >
      <div>
        {/* 🔵 Logo & Collapse */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain size={collapsed ? 24 : 32} className="text-blue-600" />
            {!collapsed && (
              <h2 className="text-xl font-bold text-gray-700 dark:text-white">AI Chat</h2>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* 🟦 New Chat */}
        <button
          onClick={newChat}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg transition mb-4`}
        >
          <div className="flex items-center gap-2">
            <SquarePen size={16} />
            {!collapsed && <span>New chat</span>}
          </div>
        </button>

        {/* 🟢 Chat History */}
        {!collapsed && (
          <ul className="space-y-2">
            {previousPrompt.length === 0 ? (
              <li className="text-sm text-gray-500">No previous chats</li>
            ) : (
              previousPrompt.map((prompt, index) => (
                <li
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {prompt.length > 30 ? prompt.slice(0, 30) + '...' : prompt}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="text-sm text-gray-500 mt-6">© 2025 AI Chatbot</div>
      )}
    </aside>
  )
}
