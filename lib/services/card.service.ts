import { Card } from '../supabase/models'
import { SupabaseClient } from '@supabase/supabase-js'
import { cardCreateLimiter, cardUpdateLimiter, cardMoveLimiter, cardDeleteLimiter } from '../ratelimit'
import { RateLimitError } from '../ratelimit-errors'

export const cardService = {
  async getCardsByBoard(supabase: SupabaseClient, boardId: number): Promise<Card[]> {
    const { data, error } = await supabase
      .from('cards')
      .select(
        `
        *,
        columns!inner(board_id)
        `
      )
      .eq('columns.board_id', boardId)
      .order('position', { ascending: true })

    if (error) throw error

    // Remove the columns property added by the join
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (data || []).map(({ columns, ...card }) => card as Card)
  },

  async createCard(
    supabase: SupabaseClient,
    card: Omit<Card, 'id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<Card> {
    const rateLimitResult = await cardCreateLimiter.limit(userId)

    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      throw new RateLimitError(
        `Too many card creations. Please try again in ${resetInSeconds} seconds.`,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset
      )
    }

    const { data, error } = await supabase.from('cards').insert(card).select().single()

    if (error) throw error

    return data
  },

  async updateCard(supabase: SupabaseClient, cardId: number, updates: Partial<Card>, userId: string): Promise<Card> {
    const rateLimitResult = await cardUpdateLimiter.limit(userId)

    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      throw new RateLimitError(
        `Too many card updates. Please try again in ${resetInSeconds} seconds.`,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset
      )
    }

    const { data, error } = await supabase
      .from('cards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', cardId)
      .select()
      .single()

    if (error) throw error

    return data
  },

  async moveCard(supabase: SupabaseClient, cardId: number, newColumnId: number, newPosition: number, userId: string) {
    const rateLimitResult = await cardMoveLimiter.limit(userId)

    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      throw new RateLimitError(
        `Too many card moves. Please try again in ${resetInSeconds} seconds.`,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset
      )
    }

    // Use PostgreSQL function for batch update (eliminates N+1 query problem)
    const { error } = await supabase.rpc('move_card_batch', {
      p_card_id: cardId,
      p_new_column_id: newColumnId,
      p_new_position: newPosition
    })

    if (error) {
      console.error('Error moving card:', error)
      throw error
    }
  },

  async deleteCard(supabase: SupabaseClient, cardId: number, userId: string) {
    const rateLimitResult = await cardDeleteLimiter.limit(userId)

    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      throw new RateLimitError(
        `Too many card deletions. Please try again in ${resetInSeconds} seconds.`,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset
      )
    }

    const { error } = await supabase.from('cards').delete().eq('id', cardId)

    if (error) throw error
  }
}
