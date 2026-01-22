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
