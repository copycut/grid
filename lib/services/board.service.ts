import { Board } from '../supabase/models'
import { SupabaseClient } from '@supabase/supabase-js'
import { boardCreateLimiter, boardUpdateLimiter, boardDeleteLimiter, boardLoadLimiter } from '../ratelimit'
import { RateLimitError } from '../ratelimit-errors'

export const boardService = {
  async getBoard(supabase: SupabaseClient, boardId: number): Promise<Board> {
    const { data, error } = await supabase.from('boards').select('*').eq('id', boardId).single()

    if (error) throw error

    return data
  },

  async getBoards(supabase: SupabaseClient, userId: string, signal?: AbortSignal): Promise<Board[]> {
    const rateLimitResult = await boardLoadLimiter.limit(userId)

    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      throw new RateLimitError(
        `Too many requests. Please try again in ${resetInSeconds} seconds.`,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset
      )
    }

    let query = supabase
      .from('boards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (signal) {
      query = query.abortSignal(signal)
    }

    const { data, error } = await query

    if (error) throw error

    return data || []
  },

  async createBoard(
    supabase: SupabaseClient,
    board: Omit<Board, 'id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<Board> {
    const rateLimitResult = await boardCreateLimiter.limit(userId)

    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      throw new RateLimitError(
        `Too many board creations. Please try again in ${resetInSeconds} seconds.`,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset
      )
    }

    const { data, error } = await supabase.from('boards').insert(board).select().single()

    if (error) throw error

    return data
  },

  async updateBoard(
    supabase: SupabaseClient,
    boardId: number,
    updates: Partial<Board>,
    userId: string
  ): Promise<Board> {
    const rateLimitResult = await boardUpdateLimiter.limit(userId)

    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      throw new RateLimitError(
        `Too many board updates. Please try again in ${resetInSeconds} seconds.`,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset
      )
    }

    const { data, error } = await supabase
      .from('boards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', boardId)
      .select()
      .single()

    if (error) throw error

    return data
  },

  async deleteBoard(supabase: SupabaseClient, boardId: number, userId: string) {
    const rateLimitResult = await boardDeleteLimiter.limit(userId)

    if (!rateLimitResult.success) {
      const resetInSeconds = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      throw new RateLimitError(
        `Too many board deletions. Please try again in ${resetInSeconds} seconds.`,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset
      )
    }

    const { error } = await supabase.from('boards').delete().eq('id', boardId)

    if (error) throw error
  }
}
