import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY! // Make sure this is set in `.env.local`
})

export async function extractRelevantContent(rawText: string): Promise<string> {
  const prompt = `
You are a helpful assistant. From the following website content, extract only the relevant textual information that would help a chatbot answer user questions about the business (e.g., services, company background, contact info, product details, mission statement, owners and stakeholder, employees and etc.). Ignore navigation links, policy statements, repetitive UI elements, or generic text.

Text:
"""${rawText}"""

Extracted:
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    messages: [
      { role: 'system', content: 'You are an information extractor.' },
      { role: 'user', content: prompt }
    ]
  })

  return response.choices[0].message.content || ''
}
