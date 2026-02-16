import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { boardDataService } from '@/lib/services/board-data.service'
import BoardClient from './BoardClient'

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  const { id } = await params
  const boardId = Number(id)

  // Validate that boardId is a valid number
  if (isNaN(boardId) || boardId <= 0) {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  let board, columns
  try {
    const result = await boardDataService.getBoardWithColumns(supabase, boardId)
    board = result.board
    columns = result.columns
  } catch (error) {
    console.error('Error loading board:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    redirect('/dashboard')
  }

  if (!board) {
    redirect('/dashboard')
  }

  return <BoardClient initialBoard={board} initialColumns={columns} boardId={boardId} />
}
