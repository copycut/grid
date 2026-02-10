import { SupabaseClient } from '@supabase/supabase-js'
import { boardService } from './board.service'
import { columnService } from './column.service'
import { cardService } from './card.service'

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
    const board = await boardService.createBoard(
      supabase,
      {
        title: boardData.title,
        user_id: boardData.user_id
      },
      boardData.user_id
    )

    return { board, columns: [] }
  },

  async createBoardWithDefaultColumns(supabase: SupabaseClient, boardData: { title: string; user_id: string }) {
    const board = await boardService.createBoard(
      supabase,
      {
        title: boardData.title,
        user_id: boardData.user_id
      },
      boardData.user_id
    )

    const defaultColumns = [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Review', position: 2 },
      { title: 'Done', position: 3 }
    ]

    const columns = await Promise.all(
      defaultColumns.map((column) =>
        columnService.createColumn(
          supabase,
          {
            ...column,
            board_id: board.id
          },
          boardData.user_id
        )
      )
    )

    return { board, columns }
  }
}

