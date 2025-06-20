'use client'

import { createContext, useContext, useState, ReactNode, useRef } from 'react'
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
    onSent: (
        prompt?: string,
        showTyping?: boolean,
        setTypingIntervalId?: (id: NodeJS.Timeout | null) => void
    ) => Promise<void>;
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
    // const [stopRequested, setStopRequested] = useState(false)
    const stopRequestedRef = useRef(false)

    const stopGenerating = () => {
        stopRequestedRef.current = true;
        setLoading(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const delayPara = (index: number, nextWord: string) => {
        setTimeout(() => {
            if (!stopRequestedRef) {
                setResultData((prev) => prev + nextWord)
            }
        }, 75 * index)
    }


    const newChat = () => {
        setLoading(false)
        setShowResult(false)
        setResultData('')
    }

    const onSent = async (
        prompt?: string,
        showTyping = true,
        setTypingIntervalId?: (id: NodeJS.Timeout | null) => void
    ) => {
        // setStopRequested(false);
        stopRequestedRef.current = false;
        setResultData('');
        setLoading(showTyping);
        setShowResult(true);

        const query = prompt ?? input;
        if (!prompt) setPreviousPrompt((prev) => [...prev, input]);
        setRecentPrompt(query);

        const response = await runChat(query);

        const responseArray = response.split('**');
        let newResponse = '';
        for (let i = 0; i < responseArray.length; i++) {
            if (i === 0 || i % 2 !== 1) {
                newResponse += responseArray[i];
            } else {
                newResponse += `<b>${responseArray[i]}</b>`;
            }
        }

        const formattedResponse = newResponse.split('*').join('</br>');

        if (!showTyping) {
            setResultData(formattedResponse);
            setLoading(false);
            setInput('');
            return;
        }

        const words = formattedResponse.split(' ');
        let i = 0;

        const intervalId = setInterval(() => {
            if (stopRequestedRef.current || i >= words.length) {
                clearInterval(intervalId);
                setLoading(false);
                return;
            }
            setResultData((prev) => prev + words[i] + ' ');
            i++;
        }, 75);

        if (setTypingIntervalId) setTypingIntervalId(intervalId);

        setInput('');
    };



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
        stopGenerating,
    }

    return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useChatContext = () => {
    const context = useContext(Context)
    if (!context) throw new Error('useChatContext must be used within ContextProvider')
    return context
}

export default ContextProvider
