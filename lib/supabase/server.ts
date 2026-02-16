import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'

export async function createClient() {
  const cookiesStore = await cookies()
  const { getToken } = await auth()

  let token: string | null = null
  try {
    token = await getToken({ template: 'supabase' })
  } catch (error) {
    console.error('Failed to get Clerk token for Supabase:', error)
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string,
    {
      cookies: {
        getAll() {
          return cookiesStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookiesStore.set(name, value, options)
            })
          } catch (error) {
            console.error('Failed to set cookies:', error)
          }
        }
      },
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    }
  )
}
