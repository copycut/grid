'use client'
import { useSession } from '@clerk/clerk-react'
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

type SupabaseContext = {
  supabase: SupabaseClient | null
  isLoaded: boolean
}

const Context = createContext<SupabaseContext>({ supabase: null, isLoaded: false })

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession()
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!session) return

    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string,
      {
        accessToken: async () => session?.getToken() ?? null
      }
    )

    setSupabase(client)
    setIsLoaded(true)
  }, [session])

  return (
    <Context.Provider value={{ supabase, isLoaded }}>{!isLoaded ? <div>Loading...</div> : children}</Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
