'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import runChat from '../config/gemini'

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
  onSent: (prompt?: string) => void
}

export const Context = createContext<ContextType | undefined>(undefined)

const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [input, setInput] = useState('')
  const [recentPrompt, setRecentPrompt] = useState('')
  const [previousPrompt, setPreviousPrompt] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultData, setResultData] = useState('')

  const delayPara = (index: number, nextWord: string) => {
    setTimeout(() => {
      setResultData((prev) => prev + nextWord)
    }, 75 * index)
  }

  const newChat = () => {
    setLoading(false)
    setShowResult(false)
    setResultData('')
  }

  const onSent = async (prompt?: string) => {
    setResultData('')
    setLoading(true)
    setShowResult(true)

    let response
    if (prompt !== undefined) {
      response = await runChat(prompt)
      setRecentPrompt(prompt)
    } else {
      setPreviousPrompt((prev) => [...prev, input])
      setRecentPrompt(input)
      response = await runChat(input)
    }

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
    const words = formattedResponse.split(' ')
    for (let i = 0; i < words.length; i++) {
      delayPara(i, words[i] + ' ')
    }

    setLoading(false)
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
  }

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useChatContext = () => {
  const context = useContext(Context)
  if (!context) throw new Error('useChatContext must be used within ContextProvider')
  return context
}

export default ContextProvider
