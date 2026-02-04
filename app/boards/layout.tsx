import SupabaseProvider from '@/lib/supabase/SupabaseProvider'

export default function BoardsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <SupabaseProvider>{children}</SupabaseProvider>
}