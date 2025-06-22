'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ChatBox from '@/components/Chatbox'

export default function EmbedLoader() {
  const searchParams = useSearchParams()
  const [client, setClient] = useState<string | null>(null)

  useEffect(() => {
    const clientParam = searchParams.get('client')
    setClient(clientParam)
  }, [searchParams])

  return (
    <div className="w-[350px] h-[500px] border rounded shadow-lg overflow-hidden">
      <ChatBox client={client} compact />
    </div>
  )
}
