'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { columnService } from '@/lib/services/column.service'
import { Column } from '@/lib/supabase/models'

export async function createColumn(title: string, boardId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  if (!title?.trim()) {
    throw new Error('Title is required')
  }

  const supabase = await createClient()

  const column = await columnService.createColumn(
    supabase,
    { title: title.trim(), board_id: boardId, position: 0 },
    userId
  )

  revalidatePath(`/boards/${boardId}`)

  return column
}

export async function updateColumn(columnId: number, updates: Partial<Column>, boardId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  const column = await columnService.updateColumn(supabase, columnId, updates, userId)

  revalidatePath(`/boards/${boardId}`)

  return column
}

export async function deleteColumn(columnId: number, boardId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  await columnService.deleteColumn(supabase, columnId, userId)

  revalidatePath(`/boards/${boardId}`)
}

export async function moveColumn(columnId: number, newPosition: number, boardId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  await columnService.moveColumn(supabase, columnId, newPosition, userId)

  revalidatePath(`/boards/${boardId}`)
}
