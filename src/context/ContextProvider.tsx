'use client'

import { createContext, useContext, useState, ReactNode, useRef } from 'react'
import runChat from '../config/gemini'

type Message = {
  from: 'user' | 'ai'
  text: string
}

type ContextType = {
  input: string
  setInput: (input: string) => void
  previousPrompt: string[]
  setPreviousPrompt: (prompts: string[]) => void
  recentPrompt: string
  setRecentPrompt: (prompt: string) => void
  resultData: string
  showResult: boolean
  loading: boolean
  newChat: () => void
  onSent: (
    prompt?: string,
    showTyping?: boolean,
    setTypingIntervalId?: (id: NodeJS.Timeout | null) => void
  ) => Promise<void>
  stopGenerating: () => void
}

export const Context = createContext<ContextType | undefined>(undefined)

const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [input, setInput] = useState('')
  const [recentPrompt, setRecentPrompt] = useState('')
  const [previousPrompt, setPreviousPrompt] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultData, setResultData] = useState('')
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const stopRequestedRef = useRef(false)

  const stopGenerating = () => {
    stopRequestedRef.current = true
    setLoading(false)
  }

  const newChat = () => {
    stopRequestedRef.current = false
    setLoading(false)
    setShowResult(false)
    setResultData('')
    setInput('')
    setRecentPrompt('')
    setPreviousPrompt([])
    setChatHistory([]) // 🟡 reset chat history
  }

  const onSent = async (
    prompt?: string,
    showTyping = true,
    setTypingIntervalId?: (id: NodeJS.Timeout | null) => void
  ) => {
    stopRequestedRef.current = false
    setLoading(showTyping)
    setShowResult(true)

    const query = prompt ?? input
    if (!prompt) setPreviousPrompt((prev) => [...prev, input])
    setRecentPrompt(query)

    const fullHistory = [...chatHistory, { from: 'user', text: query }]
    const response = await runChat(fullHistory) // ✅ use full history

    // Update history
    setChatHistory((prev) => [...prev, { from: 'user', text: query }, { from: 'ai', text: response }])

    const responseArray = response.split('**')
    let newResponse = ''
    for (let i = 0; i < responseArray.length; i++) {
      if (i === 0 || i % 2 !== 1) {
        newResponse += responseArray[i]
      } else {
        newResponse += `<b>${responseArray[i]}</b>`
      }
    }

    const formattedResponse = newResponse.split('*').join('</br>')

    const promptHtml = `<div class="font-semibold text-right text-blue-600 my-2">${query}</div>`
    const responseStart = `<div class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white my-2 rounded-lg p-3">`
    const responseEnd = `</div>`

    if (!showTyping) {
      setResultData((prev) => prev + promptHtml + responseStart + formattedResponse + responseEnd)
      setLoading(false)
      setInput('')
      return
    }

    setResultData((prev) => prev + promptHtml + responseStart)

    const words = formattedResponse.split(' ')
    let i = 0

    const intervalId = setInterval(() => {
      if (stopRequestedRef.current || i >= words.length) {
        clearInterval(intervalId)
        setResultData((prev) => prev + responseEnd)
        setLoading(false)
        return
      }
      setResultData((prev) => prev + words[i] + ' ')
      i++
    }, 75)

    if (setTypingIntervalId) setTypingIntervalId(intervalId)
    setInput('')
  }

  const value: ContextType = {
    input,
    setInput,
    previousPrompt,
    setPreviousPrompt,
    recentPrompt,
    setRecentPrompt,
    resultData,
    showResult,
    loading,
    newChat,
    onSent,
    stopGenerating
  }

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useChatContext = () => {
  const context = useContext(Context)
  if (!context) throw new Error('useChatContext must be used within ContextProvider')
  return context
}

export default ContextProvider
