'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Mic, Send } from 'lucide-react'

export default function ChatBox() {
  type Message = { from: 'user' | 'ai'; text: string }
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages([...messages, { from: 'user', text: input }])
    setInput('')
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'ai', text: "Here's a reply from AI." }])
    }, 1000)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-screen w-full bg-[#f3f3f3] dark:bg-[#212121]">
      {/* Chat Area */}
      <div className={`flex-1 overflow-y-auto px-4 py-6 ${isEmpty ? 'flex items-center justify-center' : ''}`}>
        <div className="w-full max-w-2xl mx-auto">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center w-full space-y-6 text-center">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-100">
                What are you working on?
              </h2>
              <InputBar
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}
                showRounded={true}
              />
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 rounded-xl text-sm w-fit ${
                    msg.from === 'ai'
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 self-start'
                      : 'bg-blue-600 text-white self-end'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Input */}
      {!isEmpty && (
        <div className="border-t bg-white dark:bg-[#1a1a1a] dark:border-gray-800 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <InputBar
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              showRounded={false}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function InputBar({
  input,
  setInput,
  sendMessage,
  showRounded,
}: {
  input: string
  setInput: (val: string) => void
  sendMessage: () => void
  showRounded: boolean
}) {
  return (
    <div
      className={`w-full flex items-center gap-3 ${
        showRounded
          ? 'bg-white dark:bg-[#2c2c2c] px-6 py-4 border border-gray-300 dark:border-gray-700 rounded-3xl'
          : ''
      }`}
    >
      {/* Plus Icon */}
      <button title="Attach file" className="text-gray-500 dark:text-gray-400 hover:text-blue-500">
        <Plus size={18} />
      </button>

      {/* Input */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Ask anything"
        className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500"
      />

      {/* Mic + Send */}
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <button title="Mic (coming soon)" disabled>
          <Mic size={18} />
        </button>
        <button onClick={sendMessage} title="Send">
          <Send size={18} className="hover:text-blue-600 transition" />
        </button>
      </div>
    </div>
  )
}
