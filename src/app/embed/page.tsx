'use client'

import { useSearchParams } from 'next/navigation'
import ChatBox from '@/components/Chatbox' 
import { useEffect, useState } from 'react'

export default function EmbedPage() {
  const searchParams = useSearchParams()
  const [client, setClient] = useState<string | null>(null)

  useEffect(() => {
    const clientParam = searchParams.get('client')
    setClient(clientParam)
  }, [searchParams])


  return (
    <div className="w-[350px] h-[500px] border rounded shadow-lg overflow-hidden">
      <ChatBox client={client} compact/>
    </div>
  )
}
