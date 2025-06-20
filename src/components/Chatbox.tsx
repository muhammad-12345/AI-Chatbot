'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Mic, Send } from 'lucide-react'
import { useChatContext } from '@/context/ContextProvider'

export default function ChatBox() {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    input,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setInput,
    resultData,
    loading,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSent,
    showResult,
    recentPrompt,
  } = useChatContext()

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const [hasMounted, setHasMounted] = useState(false) // ✅ Fix hydration issue

  useEffect(() => {
    setHasMounted(true) // ✅ Wait for client
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [resultData])

  if (!hasMounted) return null // ✅ Prevent mismatched SSR/CSR

  const isEmpty = !showResult && !loading

  return (
    <div className="flex flex-col h-screen w-full bg-[#f3f3f3] dark:bg-[#212121]">
      <div className={`flex-1 overflow-y-auto px-4 py-6 ${isEmpty ? 'flex items-center justify-center' : ''}`}>
        <div className="w-full max-w-2xl mx-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center w-full space-y-6 text-center">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-100">
                What are you working on?
              </h2>
              <InputBar showRounded />
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {recentPrompt && (
                <div className="px-4 py-3 rounded-xl text-sm w-fit bg-blue-600 text-white self-end">
                  {recentPrompt}
                </div>
              )}
              <div
                className="px-4 py-3 rounded-xl text-sm w-fit bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 self-start"
                dangerouslySetInnerHTML={{ __html: resultData ?? '' }} // ✅ Safer
              />
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {!isEmpty && (
        <div className="border-t bg-white dark:bg-[#1a1a1a] dark:border-gray-800 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <InputBar showRounded />
          </div>
        </div>
      )}
    </div>
  )
}

function InputBar({ showRounded }: { showRounded: boolean }) {
  const { input, setInput, onSent } = useChatContext()

  return (
    <div className={`w-full flex items-center gap-3 ${showRounded
      ? 'bg-white dark:bg-[#2c2c2c] px-6 py-4 border border-gray-300 dark:border-gray-700 rounded-3xl'
      : ''
      }`}>
      <button title="Attach file" className="text-gray-500 dark:text-gray-400 hover:text-blue-500">
        <Plus size={18} />
      </button>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSent()}
        placeholder="Ask anything"
        className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500"
      />
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <button title="Mic (coming soon)" disabled>
          <Mic size={18} />
        </button>
        <button onClick={() => onSent()} title="Send">
          <Send size={18} className="hover:text-blue-600 transition" />
        </button>
      </div>
    </div>
  )
}
