/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'

// ✅ Fix for missing global types
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        webkitSpeechRecognition: any
        SpeechRecognition: any
    }

    // ✅ Only needed if SpeechRecognitionEvent is not recognized
    interface SpeechRecognitionEvent extends Event {
        results: {
            [index: number]: {
                [index: number]: {
                    transcript: string
                }
            }
        }
    }
}

export function useSpeechRecognition(onTranscriptReady?: (text: string) => void) {
    const [transcript, setTranscript] = useState('')
    const [listening, setListening] = useState(false)
    const [supported, setSupported] = useState(false)

    useEffect(() => {
        const isSupported = typeof window !== 'undefined' &&
            ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
        setSupported(isSupported)
    }, [])

    const startListening = async () => {
        try {


            // Ask permission explicitly (for mobile Safari etc.)
            await navigator.mediaDevices.getUserMedia({ audio: true })

            const SpeechRecognitionClass =
                window.SpeechRecognition || window.webkitSpeechRecognition

            if (!SpeechRecognitionClass) return

            const recognition = new SpeechRecognitionClass()
            recognition.continuous = false
            recognition.interimResults = false
            recognition.lang = 'en-US'

            recognition.onstart = () => setListening(true)
            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const finalTranscript = event.results[0][0].transcript
                setTranscript(finalTranscript)
                if (onTranscriptReady) {
                    onTranscriptReady(finalTranscript)
                }
            }

            recognition.onend = () => setListening(false)
            recognition.onerror = () => setListening(false)

            recognition.start()
        } catch (err) {
            console.error('Microphone access denied:', err)
        }
    }

    return { transcript, listening, supported, startListening }
}
