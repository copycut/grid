'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cardService } from '@/lib/services/card.service'
import { Card } from '@/lib/supabase/models'

export async function createCard(
  cardData: { title: string; description?: string; priority?: Card['priority']; position: number },
  columnId: number,
  boardId: number
) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  const card = await cardService.createCard(
    supabase,
    {
      ...cardData,
      description: cardData.description || '',
      priority: cardData.priority || 'default',
      position: cardData.position,
      column_id: columnId
    },
    userId
  )

  revalidatePath(`/boards/${boardId}`)

  return card
}

export async function updateCard(cardId: number, updates: Partial<Card>, boardId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  const card = await cardService.updateCard(supabase, cardId, updates, userId)

  revalidatePath(`/boards/${boardId}`)

  return card
}

export async function moveCard(cardId: number, newColumnId: number, newPosition: number, boardId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  await cardService.moveCard(supabase, cardId, newColumnId, newPosition, userId)

  revalidatePath(`/boards/${boardId}`)
}

export async function deleteCard(cardId: number, boardId: number) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  await cardService.deleteCard(supabase, cardId, userId)

  revalidatePath(`/boards/${boardId}`)
}
