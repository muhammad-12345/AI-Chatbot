import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { scrapeWebsiteText } from '@/scripts/scraper'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function embedAndStoreWebsite(clientId: string, url: string) {
  const docChunks = await scrapeWebsiteText(url) // Already filtered + chunked

  for (const chunk of docChunks) {
    try {
      const embedding = await getEmbedding(chunk)
      await supabase.from('client_knowledge').insert({
        client_id: clientId,
        content: chunk,
        embedding
      })
    } catch (err) {
      console.error('❌ Error embedding or storing chunk:', err)
    }
  }
}

async function getEmbedding(text: string) {
  const model = genAI.getGenerativeModel({ model: 'embedding-001' })
  const result = await model.embedContent(text)
  return result.embedding.values
}
