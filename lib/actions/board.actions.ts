'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { boardService } from '@/lib/services/board.service'
import { boardDataService } from '@/lib/services/board-data.service'
import { Board } from '@/lib/supabase/models'

export async function createBoard(title: string, background_color: string, createDefaultColumns: boolean = false) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  if (!title?.trim()) {
    throw new Error('Title is required')
  }

  const supabase = await createClient()

  let result
  if (createDefaultColumns) {
    result = await boardDataService.createBoardWithDefaultColumns(supabase, {
      title: title.trim(),
      user_id: userId,
      background_color
    })
  } else {
    result = await boardDataService.createBoardWithoutColumns(supabase, {
      title: title.trim(),
      user_id: userId,
      background_color
    })
  }

  revalidatePath('/dashboard')

  return result.board
}

export async function updateBoard(boardId: number, updates: Partial<Board>) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  const board = await boardService.updateBoard(supabase, boardId, updates, userId)

  revalidatePath('/dashboard')
  revalidatePath(`/boards/${boardId}`)

  return board
}

export async function deleteBoard(boardId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  await boardService.deleteBoard(supabase, boardId, userId)

  revalidatePath('/dashboard')
}
