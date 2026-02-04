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
    await supabase.from('columns').update({ position: newPosition }).eq('id', columnId)

    // Reorder all columns in the board
    const { data: column } = await supabase.from('columns').select('board_id').eq('id', columnId).single()

    if (column) {
      const { data: allColumns } = await supabase
        .from('columns')
        .select('id')
        .eq('board_id', column.board_id)
        .order('position')

      if (allColumns) {
        await Promise.all(
          allColumns.map((col, index) => supabase.from('columns').update({ position: index }).eq('id', col.id))
        )
      }
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
    // Get the card being moved
    const { data: movingCard } = await supabase.from('cards').select('column_id, position').eq('id', cardId).single()

    if (!movingCard) throw new Error('Card not found')

    const oldColumnId = movingCard.column_id
    const oldPosition = movingCard.position

    // Get all cards in the target column (before moving)
    const { data: targetColumnCards } = await supabase
      .from('cards')
      .select('id, position')
      .eq('column_id', newColumnId)
      .order('position')

    if (!targetColumnCards) return

    // If moving within the same column
    if (oldColumnId === newColumnId) {
      // Adjust positions for cards between old and new position
      if (oldPosition < newPosition) {
        // Moving down: shift cards between old and new position up
        const cardsToUpdate = targetColumnCards.filter(
          (card) => card.position > oldPosition && card.position <= newPosition
        )

        const updates = cardsToUpdate.map((card) =>
          supabase
            .from('cards')
            .update({ position: card.position - 1 })
            .eq('id', card.id)
        )

        await Promise.all(updates)
      } else if (oldPosition > newPosition) {
        // Moving up: shift cards between new and old position down
        const cardsToUpdate = targetColumnCards.filter(
          (card) => card.position >= newPosition && card.position < oldPosition
        )

        const updates = cardsToUpdate.map((card) =>
          supabase
            .from('cards')
            .update({ position: card.position + 1 })
            .eq('id', card.id)
        )

        await Promise.all(updates)
      }
    } else {
      // Moving to a different column
      // Shift cards in the new column at or after the new position down
      const updates = targetColumnCards
        .filter((card) => card.position >= newPosition)
        .map((card) =>
          supabase
            .from('cards')
            .update({ position: card.position + 1 })
            .eq('id', card.id)
        )

      await Promise.all(updates)

      // Shift cards in the old column after the old position up
      const { data: oldColumnCards } = await supabase
        .from('cards')
        .select('id, position')
        .eq('column_id', oldColumnId)
        .order('position')

      if (oldColumnCards) {
        const oldUpdates = oldColumnCards
          .filter((card) => card.position > oldPosition)
          .map((card) =>
            supabase
              .from('cards')
              .update({ position: card.position - 1 })
              .eq('id', card.id)
          )

        await Promise.all(oldUpdates)
      }
    }

    // Finally, move the card to its new position
    const { error } = await supabase
      .from('cards')
      .update({ column_id: newColumnId, position: newPosition, updated_at: new Date().toISOString() })
      .eq('id', cardId)

    if (error) {
      console.error('Error updating card position:', error)
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
