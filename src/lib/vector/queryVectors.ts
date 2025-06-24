import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function queryRelevantKnowledge(clientId: string, query: string) {
  const model = genAI.getGenerativeModel({ model: 'embedding-001' })
  const result = await model.embedContent(query)
  const queryEmbedding = result.embedding.values

  const { data, error } = await supabase.rpc('match_client_knowledge', {
    query_embedding: queryEmbedding,
    client_id_param: clientId,
    match_threshold: 0.78,
    match_count: 3
  })

  if (error) throw error
  return data
}
