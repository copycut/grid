'use client'
import SupabaseProvider from '@/lib/supabase/SupabaseProvider'
import AuthGuard from '@/app/components/auth/AuthGuard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <AuthGuard>{children}</AuthGuard>
    </SupabaseProvider>
  )
}
