import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' }) // ✅ Explicitly load .env.local

import { embedAndStoreWebsite } from '@/lib/vector/embedAndStore'

async function run() {
  await embedAndStoreWebsite('my-portfolio', 'https://my-portfolio-beige-six-19.vercel.app/')
  console.log('✅ Embedding done!')
}

run().catch(console.error)
