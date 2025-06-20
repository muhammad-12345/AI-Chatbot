'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Mic, Send, Square } from 'lucide-react'
import { useChatContext } from '@/context/ContextProvider'

export default function ChatBox() {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    input,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setInput,
    resultData,
    loading,
    onSent,
    showResult,
    stopGenerating,
  } = useChatContext()

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const [isStopped, setIsStopped] = useState(false)
  const [typingIntervalId, setTypingIntervalId] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [resultData])

  if (!hasMounted) return null

  const isEmpty = !showResult && !loading

  const handleStop = () => {
    setIsStopped(true)
    if (typingIntervalId) clearInterval(typingIntervalId)
    stopGenerating()
  }

  const handleSend = () => {
    setIsStopped(false)
    onSent(undefined, true, setTypingIntervalId)
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#f3f3f3] dark:bg-[#212121]">
      <div className={`flex-1 overflow-y-auto px-4 py-6 ${isEmpty ? 'flex items-center justify-center' : ''}`}>
        <div className="w-full max-w-2xl mx-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center w-full space-y-6 text-center">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-100">
                What are you working on?
              </h2>
              <InputBar
                showRounded
                handleStop={handleStop}
                isStopped={isStopped}
                setTypingIntervalId={setTypingIntervalId}
                handleSend={handleSend}
              />
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: resultData }}
              />
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* ✅ Only show bottom input if there's a result */}
      {!isEmpty && (
        <div className="border-t bg-white dark:bg-[#1a1a1a] dark:border-gray-800 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <InputBar
              showRounded
              handleStop={handleStop}
              isStopped={isStopped}
              setTypingIntervalId={setTypingIntervalId}
              handleSend={handleSend}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function InputBar({
  showRounded,
  handleStop,
  isStopped,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setTypingIntervalId,
  handleSend,
}: {
  showRounded: boolean
  handleStop: () => void
  isStopped: boolean
  setTypingIntervalId: (id: NodeJS.Timeout | null) => void
  handleSend: () => void
}) {
  const { input, setInput, loading } = useChatContext()

  return (
    <div className={`w-full flex items-center gap-3 ${showRounded
      ? 'bg-white dark:bg-[#2c2c2c] px-6 py-4 border border-gray-300 dark:border-gray-700 rounded-3xl'
      : ''}`}>
      <button title="Attach file" className="text-gray-500 dark:text-gray-400 hover:text-blue-500">
        <Plus size={18} />
      </button>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Ask anything"
        className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500"
      />
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <button title="Mic (coming soon)" disabled>
          <Mic size={18} />
        </button>
        {loading && !isStopped ? (
          <button onClick={handleStop} title="Stop">
            <Square size={18} className="hover:text-red-500 transition" />
          </button>
        ) : (
          <button onClick={handleSend} title="Send">
            <Send size={18} className="hover:text-blue-600 transition" />
          </button>
        )}
      </div>
    </div>
  )
}
