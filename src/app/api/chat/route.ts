import { NextRequest, NextResponse } from 'next/server'
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

const MODEL_NAME = 'gemini-1.5-flash'
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Message = {
  from: 'user' | 'ai'
  text: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages, clientId }: { messages: Message[]; clientId?: string } = await req.json()

    let latestMessage = messages[messages.length - 1].text

    // ✅ If personalization is required
    if (clientId) {
      try {
        const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' })
        const result = await embeddingModel.embedContent(latestMessage)
        const queryEmbedding = result.embedding.values

        const { data, error } = await supabase.rpc('match_client_knowledge', {
          query_embedding: queryEmbedding,
          client_id_param: clientId,
          match_threshold: 0.78,
          match_count: 3,
        })

        if (error) throw error

        const personalizedContext = data.map((c: { content: string }) => c.content).join('\n\n')

        latestMessage = `Use the following client-specific context:\n\n${personalizedContext}\n\nUser: ${latestMessage}`
      } catch (e) {
        console.error('❌ Personalization failed:', e)
        // Continue without personalization if embedding fails
      }
    }

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
      history: messages.slice(0, -1).map((m) => ({
        role: m.from === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
    })

    const result = await chat.sendMessage(latestMessage)
    const text = result.response.text()

    console.log('[Gemini Response]', text)
    return NextResponse.json({ text })
  } catch (error) {
    console.error('[Gemini Error]', error)
    return NextResponse.json({ text: '⚠️ Failed to get response from Gemini.' }, { status: 500 })
  }
}
