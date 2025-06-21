'use client'

import { useState } from 'react'
import { SquarePen, Menu, Brain, Trash2 } from 'lucide-react'
import { useChatContext } from '@/context/ContextProvider'
import { deleteChat } from '@/lib/supabase/chatService' // ✅ added

export default function Sidebar() {
  const { newChat, chatList, onSent, setInput, setChatList } = useChatContext()
  const [collapsed, setCollapsed] = useState(false)

  const handlePromptClick = async (chat: { id: string; title: string }) => {
    setInput(chat.title)
    await onSent(chat.title, false, undefined, true)
  }

  const handleDelete = async (id: string) => {
    await deleteChat(id)
    setChatList(prev => prev.filter(chat => chat.id !== id))
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
            {chatList.length === 0 ? (
              <li className="text-sm text-gray-500">No previous chats</li>
            ) : (
              chatList.map((chat) => (
                <li key={chat.id} className="relative group">
                  <div
                    onClick={() => handlePromptClick(chat)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    {chat.title}
                  </div>
                  <button
                    onClick={() => handleDelete(chat.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-sm text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {!collapsed && (
        <div className="text-sm text-gray-500 mt-6">© 2025 AI Chatbot</div>
      )}
    </aside>
  )
}
