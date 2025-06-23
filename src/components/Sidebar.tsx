'use client'

import { useState } from 'react'
import { SquarePen, Menu, Trash2 } from 'lucide-react'
import { useChatContext } from '@/context/ContextProvider'
import { deleteChat } from '@/lib/supabase/chatService' // ✅ added
import Image from 'next/image'


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
    <aside className={`h-screen bg-[#e2e2e2] dark:bg-[#1a1919] border-r dark:border-gray-800 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* 🔵 Logo & Collapse */}
      <div className="p-4 pb-2 flex items-center justify-between">
        {!collapsed && (
          <button onClick={newChat} className="cursor-pointer" title="Start New Chat">
            <Image
              src="/logo.png"
              alt="Promptly Logo"
              width={collapsed ? 40 : 100}
              height={40}
              className="object-contain"
              priority
            />
          </button>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 dark:text-gray-300 hover:text-blue-500"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* 🟦 New Chat Button */}
      <div className="px-4">
        <button
          onClick={newChat}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg transition mb-4`}
        >
          <div className="flex items-center gap-2">
            <SquarePen size={16} />
            {!collapsed && <span>New chat</span>}
          </div>
        </button>
      </div>

      {/* 🟢 Scrollable Chat List */}
      <div className="flex-1 overflow-y-auto px-4">
        {!collapsed && (
          <ul className="space-y-1 pb-4">
            {chatList.length === 0 ? (
              <li className="text-sm text-gray-500 px-2">No previous chats</li>
            ) : (
              chatList.map((chat) => (
                <li key={chat.id} className="relative group">
                  <div
                    onClick={() => handlePromptClick(chat)}
                    className="px-3 py-2 rounded-md text-sm truncate cursor-pointer 
                  bg-transparent text-gray-800 dark:text-gray-100 
                  hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-all"
                  >
                    {chat.title}
                  </div>
                  <button
                    onClick={() => handleDelete(chat.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 
                  group-hover:opacity-100 text-red-500 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="text-sm text-gray-500 px-4 py-2 border-t border-gray-300 dark:border-gray-700">
          © 2025 AI Chatbot
        </div>
      )}
    </aside>
  )
}
