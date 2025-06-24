type Message = {
  from: 'user' | 'ai'
  text: string
}

const runChat = async (messages: Message[], clientId?: string): Promise<string> => {
 try {
  const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, clientId }),
    })

    const data = await res.json()
    return data.text || 'No response'
  } catch (err) {
    console.error('[runChat Error]', err)
    return '⚠️ Failed to get response from Gemini.'
  }
}

export default runChat
