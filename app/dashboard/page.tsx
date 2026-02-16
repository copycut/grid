import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { boardService } from '@/lib/services/board.service'
import { Board } from '@/lib/supabase/models'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  const supabase = await createClient()

  let boards: Board[] = []
  try {
    boards = await boardService.getBoards(supabase, userId)
  } catch (error) {
    console.error('Server: Error loading boards:', error)
  }

  return <DashboardClient initialBoards={boards} />
}
