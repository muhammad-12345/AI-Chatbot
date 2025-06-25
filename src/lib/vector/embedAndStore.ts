import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { scrapeWebsiteText } from '@/scripts/scraper'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function embedAndStoreWebsite(clientId: string, url: string) {
  console.log(`🌐 Starting scraping for URL: ${url}`)
  
  const docChunks = await scrapeWebsiteText(url)
  console.log(`📄 Scraped and chunked ${docChunks.length} chunks.`)

  for (const [i, chunk] of docChunks.entries()) {
    try {
      console.log(`🔍 [${i + 1}/${docChunks.length}] Getting embedding for chunk (first 100 chars):\n${chunk.slice(0, 100)}`)

      const embedding = await getEmbedding(chunk)

      console.log(`📦 Inserting into Supabase (chunk length: ${chunk.length}, embedding length: ${embedding.length})`)

      const { error } = await supabase.from('client_knowledge').insert({
        client_id: clientId,
        content: chunk,
        embedding
      })

      if (error) {
        console.error('❌ Supabase insert error:', error)
      } else {
        console.log(`✅ Successfully stored chunk ${i + 1} in Supabase.`)
      }

    } catch (err) {
      console.error('❌ Error embedding or storing chunk:', err)
    }
  }

  console.log('🎉 All chunks processed.')
}

async function getEmbedding(text: string) {
  const model = genAI.getGenerativeModel({ model: 'embedding-001' })
  const result = await model.embedContent(text)
  return result.embedding.values
}
