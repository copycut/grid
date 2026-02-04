import SupabaseProvider from '@/lib/supabase/SupabaseProvider'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <SupabaseProvider>{children}</SupabaseProvider>
}