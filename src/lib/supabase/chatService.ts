// src/lib/supabase/chatService.ts
import supabase from '@/lib/supabase/supabaseClient'
// import { createServerSupabase } from '@/lib/supabase/supabaseServer' // optional, for server use

export const saveMessage = async (
  chatId: string,
  from: 'user' | 'ai',
  text: string
) => {
  const { error } = await supabase
    .from('messages')
    .insert([{ chat_id: chatId, role: from, content: text }])

  if (error) console.error('❌ Error saving message:', error)
}

export const getChatHistory = async (chatId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('❌ Error fetching chat history:', error)
    return []
  }

  return data
}

export const deleteChat = async (chatId: string) => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', chatId)

  if (error) console.error('❌ Error deleting chat:', error)
}

export const getAllChats = async () => {

  const { data, error } = await supabase
    .from('messages')
    .select('chat_id, content')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching chats:', error)
    return []
  }

  const seen = new Set()
  const chatMap: Record<string, string> = {}

  for (const msg of data) {
    if (!seen.has(msg.chat_id)) {
      chatMap[msg.chat_id] = msg.content
      seen.add(msg.chat_id)
    }
  }

  return Object.entries(chatMap).map(([id, title]) => ({
    id,
    title: title.length > 30 ? title.slice(0, 30) + '...' : title
  }))
}
