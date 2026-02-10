import { Board, Card, Column } from './supabase/models'
import { SupabaseClient } from '@supabase/supabase-js'

export const boardService = {
  async getBoard(supabase: SupabaseClient, boardId: number): Promise<Board> {
    const { data, error } = await supabase.from('boards').select('*').eq('id', boardId).single()
    if (error) throw error
    return data
  },

  async getBoards(supabase: SupabaseClient, userId: string): Promise<Board[]> {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async createBoard(supabase: SupabaseClient, board: Omit<Board, 'id' | 'created_at' | 'updated_at'>): Promise<Board> {
    const { data, error } = await supabase.from('boards').insert(board).select().single()
    if (error) throw error
    return data
  },

  async updateBoard(supabase: SupabaseClient, boardId: number, updates: Partial<Board>): Promise<Board> {
    const { data, error } = await supabase
      .from('boards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', boardId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteBoard(supabase: SupabaseClient, boardId: number) {
    const { error } = await supabase.from('boards').delete().eq('id', boardId)
    if (error) throw error
  }
}

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
    column: Omit<Column, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Column> {
    const { data, error } = await supabase.from('columns').insert(column).select().single()
    if (error) throw error
    return data
  },

  async updateColumn(supabase: SupabaseClient, columnId: number, updates: Partial<Column>): Promise<Column> {
    const { data, error } = await supabase.from('columns').update(updates).eq('id', columnId).select().single()
    if (error) throw error
    return data
  },

  async deleteColumn(supabase: SupabaseClient, columnId: number) {
    const { error } = await supabase.from('columns').delete().eq('id', columnId)
    if (error) throw error
  },

  async moveColumn(supabase: SupabaseClient, columnId: number, newPosition: number) {
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

  async createCard(supabase: SupabaseClient, card: Omit<Card, 'id' | 'created_at' | 'updated_at'>): Promise<Card> {
    const { data, error } = await supabase.from('cards').insert(card).select().single()
    if (error) throw error
    return data
  },

  async updateCard(supabase: SupabaseClient, cardId: number, updates: Partial<Card>): Promise<Card> {
    const { data, error } = await supabase
      .from('cards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', cardId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async moveCard(supabase: SupabaseClient, cardId: number, newColumnId: number, newPosition: number) {
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

  async deleteCard(supabase: SupabaseClient, cardId: number) {
    const { error } = await supabase.from('cards').delete().eq('id', cardId)
    if (error) throw error
  }
}

export const boardDataService = {
  async getBoardWithColumns(supabase: SupabaseClient, boardId: number) {
    const [board, columns] = await Promise.all([
      boardService.getBoard(supabase, boardId),
      columnService.getColumns(supabase, boardId)
    ])

    if (!board) throw new Error('Board not found')

    const cards = await cardService.getCardsByBoard(supabase, boardId)

    const columnsWithCards = columns.map((column) => {
      return {
        ...column,
        cards: cards.filter((card) => card.column_id === column.id)
      }
    })

    return { board, columns: columnsWithCards }
  },

  async createBoardWithoutColumns(supabase: SupabaseClient, boardData: { title: string; user_id: string }) {
    const board = await boardService.createBoard(supabase, {
      title: boardData.title,
      user_id: boardData.user_id
    })

    return { board, columns: [] }
  },

  async createBoardWithDefaultColumns(supabase: SupabaseClient, boardData: { title: string; user_id: string }) {
    const board = await boardService.createBoard(supabase, {
      title: boardData.title,
      user_id: boardData.user_id
    })

    const defaultColumns = [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Review', position: 2 },
      { title: 'Done', position: 3 }
    ]

    const columns = await Promise.all(
      defaultColumns.map((column) =>
        columnService.createColumn(supabase, {
          ...column,
          board_id: board.id
        })
      )
    )

    return { board, columns }
  }
}
