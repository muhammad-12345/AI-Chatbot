'use client'

import { Suspense } from 'react'
import EmbedLoader from './EmbedLoader'
import ClientLayout from '../client-layout' // ✅ correct relative import

// Optional: Avoid static rendering
export const dynamic = 'force-dynamic'

export default function EmbedPage() {
  return (
    <ClientLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <EmbedLoader />
      </Suspense>
    </ClientLayout>
  )
}
