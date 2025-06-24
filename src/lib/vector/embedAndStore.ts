import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { load } from 'cheerio'
import { scrapeWebsiteText } from '@/scripts/scraper'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function embedAndStoreWebsite(clientId: string, url: string) {
  const content = await scrapeWebsiteText(url)

  const docChunks = chunkText(Array.isArray(content) ? content.join(' ') : content, 1000)

  for (const chunk of docChunks) {
    const embedding = await getEmbedding(chunk)
    await supabase.from('client_knowledge').insert({
      client_id: clientId,
      content: chunk,
      embedding
    })
  }
}

function chunkText(text: string, maxLength: number): string[] {
  const words = text.split(' ')
  const chunks = []
  for (let i = 0; i < words.length; i += maxLength) {
    chunks.push(words.slice(i, i + maxLength).join(' '))
  }
  return chunks
}

async function getEmbedding(text: string) {
  const model = genAI.getGenerativeModel({ model: 'embedding-001' })
  const result = await model.embedContent(text)
  return result.embedding.values
}
