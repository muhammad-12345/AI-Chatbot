import { NextRequest, NextResponse } from 'next/server'
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai'

const MODEL_NAME = 'gemini-1.5-flash'
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

type Message = {
  from: 'user' | 'ai'
  text: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await req.json()

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain',
    }

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ]

    const chat = genAI.getGenerativeModel({ model: MODEL_NAME }).startChat({
      generationConfig,
      safetySettings,
      history: messages.map((m) => ({
        role: m.from === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
    })

    const latestMessage = messages[messages.length - 1].text
    const result = await chat.sendMessage(latestMessage)

    const response = result.response
    const text = response.text()

    console.log('[Gemini Response]', text)

    return NextResponse.json({ text })
  } catch (error) {
    console.error('[Gemini Error]', error)
    return NextResponse.json({ text: '⚠️ Failed to get response from Gemini.' }, { status: 500 })
  }
}
