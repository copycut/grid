'use client'
import { useSession } from '@clerk/clerk-react'
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { createContext, useContext, useMemo } from 'react'

type SupabaseContext = {
  supabase: SupabaseClient | null
  isLoaded: boolean
}

const Context = createContext<SupabaseContext>({ supabase: null, isLoaded: false })

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoaded: sessionLoaded } = useSession()

  // Create supabase client only when we have a session
  const supabase = useMemo(() => {
    if (!sessionLoaded || !session) return null

    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string,
      {
        accessToken: async () => session.getToken() ?? null
      }
    )
  }, [session?.id, sessionLoaded])

  const value = useMemo(() => ({ supabase, isLoaded: sessionLoaded }), [supabase, sessionLoaded])

  return <Context.Provider value={value}>{!sessionLoaded ? <div>Loading...</div> : children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
