import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
// import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieStore, // ✅ This must be synchronous
    }
  )
}
export default createSupabaseServerClient;