import { SquarePen } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#e2e2e2] dark:bg-[#1a1919] border-r dark:border-gray-800 p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-700 dark:text-white mb-6">My Chats</h2>

        <button className="w-full flex items-center justify-between bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg transition mb-4">
          <div className="flex items-center gap-2">
            <SquarePen size={16} />
            <span>New chat</span>
          </div>
          {/* <span className="text-xs text-gray-400">Ctrl+Shift+O</span> */}
        </button>

        {/* Dummy chat list */}
        <ul className="space-y-2">
          {[1, 2].map((id) => (
            <li
              key={id}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
            >
              Conversation {id}
            </li>
          ))}
        </ul>
      </div>

      {/* Theme toggle bottom */}
      <div className="text-sm text-gray-500 mt-6">
        © 2025 AI Chatbot
      </div>
    </aside>
  )
}


