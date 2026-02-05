'use client'
import SupabaseProvider from '@/lib/supabase/SupabaseProvider'
import AuthGuard from '@/app/components/auth/AuthGuard'

export default function BoardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <AuthGuard>{children}</AuthGuard>
    </SupabaseProvider>
  )
}
