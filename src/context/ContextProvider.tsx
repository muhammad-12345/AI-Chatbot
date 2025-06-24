'use client'

import { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react'
import supabase from '@/lib/supabase/supabaseClient'
import runChat from '../config/gemini'
import { v4 as uuidv4 } from 'uuid'
import { saveMessage } from '@/lib/supabase/chatService'
import { getChatHistory, getAllChats } from '@/lib/supabase/chatService'
import { getClientIdFromIframe } from '@/lib/utils/getClientFromURL'

type Message = {
  from: 'user' | 'ai'
  text: string
}

type ChatMeta = {
  id: string
  title: string
}

type ContextType = {
  input: string
  setInput: (input: string) => void
  // previousPrompt: string[]
  // setPreviousPrompt: (prompts: string[]) => void
  chatList: ChatMeta[]
  setChatList: React.Dispatch<React.SetStateAction<ChatMeta[]>>
  recentPrompt: string
  setRecentPrompt: (prompt: string) => void
  resultData: string
  showResult: boolean
  loading: boolean
  newChat: () => void
  onSent: (
    prompt?: string,
    showTyping?: boolean,
    setTypingIntervalId?: (id: NodeJS.Timeout | null) => void,
    isRecall?: boolean
  ) => Promise<void>
  stopGenerating: () => void
}

export const Context = createContext<ContextType | undefined>(undefined)

const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [input, setInput] = useState('')
  const [recentPrompt, setRecentPrompt] = useState('')
  // const [previousPrompt, setPreviousPrompt] = useState<string[]>([])
  const [chatList, setChatList] = useState<ChatMeta[]>([])   // ✅ New
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultData, setResultData] = useState('')
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [isFirstPrompt, setIsFirstPrompt] = useState(true) // ✅ NEW STATE
  const stopRequestedRef = useRef(false)

  const [chatId, setChatId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const isEmbedded = urlParams.has('client')

      if (isEmbedded) {
        // Always generate a new chatId in embedded mode (i.e., iframe)
        return uuidv4()
      }

      // For standalone, use persistent chatId
      const stored = localStorage.getItem('chatId')
      return stored || uuidv4()
    }
    return uuidv4()
  })

  const stopGenerating = () => {
    stopRequestedRef.current = true
    setLoading(false)
  }

  const newChat = () => {
    const newChatId = uuidv4()
    setChatId(newChatId)
    localStorage.setItem('chatId', newChatId)
    // ✅ Reset chat history and other states
    stopRequestedRef.current = false
    setLoading(false)
    setShowResult(false)
    setResultData('')
    setInput('')
    setRecentPrompt('')
    // setPreviousPrompt([])
    setChatHistory([])
    setIsFirstPrompt(true) // ✅ reset tracker
  }

  // ✅ Load chat history when component mounts
  const loadChatHistory = async (chatId: string) => {
    const messages = await getChatHistory(chatId)

    type SupabaseMessage = { role: 'user' | 'ai'; content: string }
    const formatted: Message[] = messages.map((msg: SupabaseMessage) => ({
      from: msg.role,
      text: msg.content
    }))

    setChatHistory(formatted)

    // Rebuild UI content
    const html = formatted
      .map((msg) => {
        if (msg.from === 'user') {
          return `<div class="font-semibold text-right text-blue-600 my-2">${msg.text}</div>`
        } else {
          return `<div class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white my-2 rounded-lg p-3">${msg.text}</div>`
        }
      })
      .join('')

    setResultData(html)
  }

  useEffect(() => {
    const fetchChats = async () => {
      const chats = await getAllChats()
      setChatList(chats)
    }

    fetchChats()
  }, [])


  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from('messages').select('*').limit(1)

      if (error) {
        console.error('❌ Supabase connection failed:', error)
      } else {
        console.log('✅ Supabase connected. Sample data:', data)
      }
    }

    testConnection()
    const urlParams = new URLSearchParams(window.location.search)
    const isEmbedded = urlParams.has('client')

    if (!isEmbedded && chatId) {
      localStorage.setItem('chatId', chatId)
    }

    if (chatId) {
      localStorage.setItem('chatId', chatId) // ✅ Ensures it's always saved
      loadChatHistory(chatId)
    }
  }, [chatId])

  const onSent = async (
    prompt?: string,
    showTyping = true,
    setTypingIntervalId?: (id: NodeJS.Timeout | null) => void,
    isRecall = false
  ) => {
    stopRequestedRef.current = false
    setLoading(showTyping)
    setShowResult(true)

    const query = prompt ?? input
    if (!query?.trim()) {
      setLoading(false)
      return
    }

    const clientId = getClientIdFromIframe()

    console.log('📨 Sending prompt...', { query, chatId, clientId })

    const finalPrompt = query.trim()

    if (!prompt && isFirstPrompt && !isRecall) {
      setChatList((prev) => [...prev, { id: chatId, title: query.slice(0, 30) }])
      setIsFirstPrompt(false)
    }

    setRecentPrompt(query)
    const fullHistory: Message[] = [...chatHistory, { from: 'user', text: finalPrompt }]
    let response = ''

    try {
      const safeClientId = clientId ?? undefined
      response = await runChat(fullHistory, safeClientId)

    } catch (err) {
      console.error('❌ Gemini runChat failed:', err)
      setLoading(false)
      return
    }

    setChatHistory((prev) => [...prev, { from: 'user', text: query }, { from: 'ai', text: response }])
    await saveMessage(chatId, 'user', query)
    await saveMessage(chatId, 'ai', response)

    const responseArray = response.split('**')
    let newResponse = ''
    for (let i = 0; i < responseArray.length; i++) {
      newResponse += i % 2 === 1 ? `<b>${responseArray[i]}</b>` : responseArray[i]
    }
    const formattedResponse = newResponse.split('*').join('</br>')

    const promptHtml = `<div class="bg-[#343541] text-white font-semibold px-4 py-3 rounded-lg text-sm text-right max-w-xl ml-auto">${query}</div>`
    const responseStart = `<div class="text-white my-4 leading-relaxed">`
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
    // previousPrompt,
    // setPreviousPrompt,
    chatList,
    setChatList,
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
