import { boardDataService } from '@/lib/services/board-data.service'
import { boardService } from '@/lib/services/board.service'
import { columnService } from '@/lib/services/column.service'
import { cardService } from '@/lib/services/card.service'
import { useCallback, useEffect, useState } from 'react'
import { Board, ColumnWithCards, Card } from '@/lib/supabase/models'
import { useSupabase } from '@/lib/supabase/SupabaseProvider'
import { useUser } from '@clerk/clerk-react'

export function useBoard(boardId: number) {
  const { user } = useUser()
  const { supabase } = useSupabase()
  const [board, setBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<ColumnWithCards[]>([])
  const [loadingBoard, setLoadingBoard] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadBoard = useCallback(async () => {
    if (!boardId) return

    try {
      setLoadingBoard(true)
      setError(null)
      const { board, columns } = await boardDataService.getBoardWithColumns(supabase!, boardId)
      setBoard(board)
      setColumns(columns)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load board')
      throw error
    } finally {
      setLoadingBoard(false)
    }
  }, [boardId, supabase])

  useEffect(() => {
    loadBoard()
  }, [loadBoard])

  async function updateBoard(boardId: number, updates: Partial<Board>) {
    if (!boardId) throw new Error('Board not found')
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setLoading(true)
      const updatedBoard = await boardService.updateBoard(supabase!, boardId, updates, user.id)
      setBoard(updatedBoard)
      return updatedBoard
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update board')
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function createColumn(title: string) {
    if (!boardId) throw new Error('Board not found')
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setLoading(true)
      const newColumn = await columnService.createColumn(
        supabase!,
        {
          title,
          position: columns.length,
          board_id: boardId
        },
        user.id
      )
      setColumns((prev: ColumnWithCards[]) => [...prev, { ...newColumn, cards: [] }])
      return newColumn
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create column')
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function updateColumn(columnData: ColumnWithCards) {
    if (!boardId) throw new Error('Board not found')
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setLoading(true)
      // Remove card from the column data before updating
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, cards, ...updates } = columnData

      const updatedColumn = await columnService.updateColumn(supabase!, id, updates, user.id)
      setColumns((prev: ColumnWithCards[]) =>
        prev.map((column) => {
          if (column.id === updatedColumn.id) {
            return { ...updatedColumn, cards: column.cards || [] }
          }
          return column
        })
      )
      return updatedColumn
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update column')
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function deleteColumn(columnId: number) {
    if (!boardId) throw new Error('Board not found')
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setLoading(true)
      await columnService.deleteColumn(supabase!, columnId, user.id)
      setColumns((prev) => prev.filter((column) => column.id !== columnId))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete column')
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function moveColumn(columnId: number, newPosition: number) {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      await columnService.moveColumn(supabase!, columnId, newPosition, user.id)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to move column')
      await loadBoard()
      throw error
    }
  }

  async function createCard(
    cardData: { title: string; description?: string; priority?: Card['priority'] },
    columnId: number
  ) {
    if (!boardId) throw new Error('Board not found')
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setLoading(true)
      const newCard = await cardService.createCard(
        supabase!,
        {
          ...cardData,
          description: cardData.description || '',
          priority: cardData.priority || 'default',
          position: columns.find((column) => column.id === columnId)?.cards.length || 0,
          column_id: columnId
        },
        user.id
      )

      setColumns((prev) =>
        prev.map((column) => {
          if (column.id === columnId) {
            return { ...column, cards: [...column.cards, newCard] }
          }
          return column
        })
      )
      return newCard
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create card')
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function updateCard(cardData: Card, columnId: number) {
    if (!boardId) throw new Error('Board not found')
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setLoading(true)
      const updatedCard = await cardService.updateCard(supabase!, cardData.id, cardData, user.id)

      setColumns((prev) =>
        prev.map((column) => {
          // If card is in this column
          if (column.cards.some((card) => card.id === updatedCard.id)) {
            if (column.id === columnId) {
              // Card stays in same column - update in place
              return {
                ...column,
                cards: column.cards.map((card) => (card.id === updatedCard.id ? updatedCard : card))
              }
            } else {
              // Card moved to different column - remove from this column
              return { ...column, cards: column.cards.filter((card) => card.id !== updatedCard.id) }
            }
          } else if (column.id === columnId) {
            // Card moved to this column - append to end
            return { ...column, cards: [...column.cards, updatedCard] }
          }
          return column
        })
      )
      return updatedCard
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update card')
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function moveCard(cardId: number, newColumnId: number, newPosition: number) {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      // The optimistic update is already done by handleDragOver in useDragAndDrop
      // We just need to persist to the database
      await cardService.moveCard(supabase!, cardId, newColumnId, newPosition, user.id)

      // Note: We don't update state here because handleDragOver already did the optimistic update
      // If we update here, it causes a visual jump: optimistic update → revert → API update
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to move card')
      await loadBoard()
      throw error
    }
  }

  async function deleteCard(cardId: number) {
    if (!boardId) throw new Error('Board not found')
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setLoading(true)
      await cardService.deleteCard(supabase!, cardId, user.id)

      setColumns((prev) =>
        prev.map((column) => ({
          ...column,
          cards: column.cards.filter((card) => card.id !== cardId)
        }))
      )
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete card')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    loadingBoard,
    error,
    board,
    columns,
    updateBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    setColumns,
    createCard,
    updateCard,
    moveCard,
    deleteCard,
    moveColumn
  }
}
