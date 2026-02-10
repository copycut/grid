import { Column } from '../supabase/models'
import { SupabaseClient } from '@supabase/supabase-js'
import { columnCreateLimiter, columnUpdateLimiter, columnMoveLimiter, columnDeleteLimiter } from '../ratelimit'
import { RateLimitError } from '../ratelimit-errors'

export const columnService = {
  async getColumns(supabase: SupabaseClient, boardId: number): Promise<Column[]> {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    if (error) throw error

    return data || []
  },

  async createColumn(
    supabase: SupabaseClient,
    column: Omit<Column, 'id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<Column> {
    const rateLimitResult = await columnCreateLimiter.limit(userId)

    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      throw new RateLimitError(
        `Too many column creations. Please try again in ${resetInSeconds} seconds.`,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset
      )
    }

    const { data, error } = await supabase.from('columns').insert(column).select().single()

    if (error) throw error

    return data
  },

  async updateColumn(
    supabase: SupabaseClient,
    columnId: number,
    updates: Partial<Column>,
    userId: string
  ): Promise<Column> {
    const rateLimitResult = await columnUpdateLimiter.limit(userId)

    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      throw new RateLimitError(
        `Too many column updates. Please try again in ${resetInSeconds} seconds.`,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset
      )
    }

    const { data, error } = await supabase.from('columns').update(updates).eq('id', columnId).select().single()

    if (error) throw error

    return data
  },

  async deleteColumn(supabase: SupabaseClient, columnId: number, userId: string) {
    const rateLimitResult = await columnDeleteLimiter.limit(userId)

    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      throw new RateLimitError(
        `Too many column deletions. Please try again in ${resetInSeconds} seconds.`,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset
      )
    }

    const { error } = await supabase.from('columns').delete().eq('id', columnId)

    if (error) throw error
  },

  async moveColumn(supabase: SupabaseClient, columnId: number, newPosition: number, userId: string) {
    const rateLimitResult = await columnMoveLimiter.limit(userId)

    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      throw new RateLimitError(
        `Too many column moves. Please try again in ${resetInSeconds} seconds.`,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset
      )
    }

    // Use PostgreSQL function for batch update (eliminates N+1 query problem)
    const { error } = await supabase.rpc('move_column_batch', {
      p_column_id: columnId,
      p_new_position: newPosition
    })

    if (error) {
      console.error('Error moving column:', error)
      throw error
    }
  }
}
