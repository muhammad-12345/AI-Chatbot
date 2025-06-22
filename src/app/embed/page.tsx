'use client'

import { Suspense } from 'react'
import EmbedLoader from './EmbedLoader'

// Optional: Avoid static rendering
export const dynamic = 'force-dynamic'

export default function EmbedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmbedLoader />
    </Suspense>
  )
}
