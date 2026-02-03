import { boardDataService, boardService, columnService, cardService } from '@/lib/services'
import { useUser } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import { Board, ColumnWithCards, Card } from '@/lib/supabase/models'
import { useSupabase } from '@/lib/supabase/SupabaseProvider'

export function useBoards() {
  const { user } = useUser()
  const { supabase } = useSupabase()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadBoards() {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setLoading(true)
      const boards = await boardService.getBoards(supabase!, user.id)
      setBoards(boards)
      return boards
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load boards')
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function createBoard(boardData: { title: string }) {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      setLoading(true)
      const { board } = await boardDataService.createBoardWithDefaultColumns(supabase!, {
        ...boardData,
        user_id: user?.id
      })
      setBoards((prev) => [board, ...prev])
      return board
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create board')
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function updateBoard(boardId: number, updates: Partial<Board>) {
    try {
      const updatedBoard = await boardService.updateBoard(supabase!, boardId, updates)
      setBoards((prev) => prev.map((board) => (board.id === updatedBoard.id ? updatedBoard : board)))
      return updatedBoard
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update board')
      throw error
    }
  }

  async function deleteBoard(boardId: number) {
    try {
      setLoading(true)
      await boardService.deleteBoard(supabase!, boardId)
      setBoards((prev) => prev.filter((board) => board.id !== boardId))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete board')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, boards, createBoard, loadBoards, updateBoard, deleteBoard }
}

export function useBoard(boardId: number) {
  const { supabase } = useSupabase()
  const [board, setBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<ColumnWithCards[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadBoard = useCallback(async () => {
    if (!boardId) return

    try {
      setLoading(true)
      setError(null)
      const { board, columns } = await boardDataService.getBoardWithColumns(supabase!, boardId)
      setBoard(board)
      setColumns(columns)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load board')
      throw error
    } finally {
      setLoading(false)
    }
  }, [boardId, supabase])

  useEffect(() => {
    loadBoard()
  }, [loadBoard])

  async function updateBoard(boardId: number, updates: Partial<Board>) {
    if (!boardId) throw new Error('Board not found')
    try {
      const updatedBoard = await boardService.updateBoard(supabase!, boardId, updates)
      setBoard(updatedBoard)
      return updatedBoard
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update board')
      throw error
    }
  }

  async function createColumn(title: string) {
    if (!boardId) throw new Error('Board not found')
    try {
      const newColumn = await columnService.createColumn(supabase!, {
        title,
        position: columns.length,
        board_id: boardId
      })
      setColumns((prev: ColumnWithCards[]) => [...prev, { ...newColumn, cards: [] }])
      return newColumn
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create column')
      throw error
    }
  }

  async function updateColumn(columnData: ColumnWithCards) {
    if (!boardId) throw new Error('Board not found')
    try {
      // Remove card from the column data before updating
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, cards, ...updates } = columnData

      const updatedColumn = await columnService.updateColumn(supabase!, id, updates)
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
    }
  }

  async function deleteColumn(columnId: number) {
    if (!boardId) throw new Error('Board not found')
    try {
      await columnService.deleteColumn(supabase!, columnId)
      setColumns((prev) => prev.filter((column) => column.id !== columnId))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete column')
      throw error
    }
  }

  async function createCard(
    cardData: { title: string; description?: string; priority?: Card['priority'] },
    columnId: number
  ) {
    if (!boardId) throw new Error('Board not found')
    try {
      const newCard = await cardService.createCard(supabase!, {
        ...cardData,
        description: cardData.description || '',
        priority: cardData.priority || 'default',
        position: columns.find((column) => column.id === columnId)?.cards.length || 0,
        column_id: columnId
      })

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
    }
  }

  async function updateCard(cardData: Card, columnId: number) {
    if (!boardId) throw new Error('Board not found')
    try {
      const updatedCard = await cardService.updateCard(supabase!, cardData.id, cardData)

      setColumns((prev) =>
        prev
          .map((column) => ({
            ...column,
            cards: column.cards.filter((card) => card.id !== updatedCard.id)
          }))
          .map((column) => {
            if (column.id === columnId) {
              return { ...column, cards: [...column.cards, updatedCard] }
            }
            return column
          })
      )
      return updatedCard
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update card')
      throw error
    }
  }

  async function moveCard(cardId: number, newColumnId: number, newPosition: number) {
    try {
      await cardService.moveCard(supabase!, cardId, newColumnId, newPosition)

      setColumns((prev) => {
        const newColumns = [...prev]
        let cardToMove: Card | null = null
        let oldColumnId: number | null = null

        // Find and remove the card from its current column
        for (const column of newColumns) {
          const cardIndex = column.cards.findIndex((card) => card.id === cardId)
          if (cardIndex !== -1) {
            cardToMove = column.cards[cardIndex]
            oldColumnId = column.id
            column.cards.splice(cardIndex, 1)
            break
          }
        }

        // Add card to new column and update positions
        if (cardToMove) {
          const targetColumn = newColumns.find((column) => column.id === newColumnId)
          if (targetColumn) {
            cardToMove.column_id = newColumnId
            cardToMove.position = newPosition
            targetColumn.cards.splice(newPosition, 0, cardToMove)

            // Renumber all cards in target column
            targetColumn.cards.forEach((card, index) => {
              card.position = index
            })
          }

          // Renumber cards in old column if different
          if (oldColumnId !== newColumnId) {
            const oldColumn = newColumns.find((column) => column.id === oldColumnId)
            if (oldColumn) {
              oldColumn.cards.forEach((card, index) => {
                card.position = index
              })
            }
          }
        }

        return newColumns
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to move card')
      throw error
    }
  }

  async function deleteCard(cardId: number) {
    if (!boardId) throw new Error('Board not found')

    try {
      await cardService.deleteCard(supabase!, cardId)

      setColumns((prev) =>
        prev.map((column) => ({
          ...column,
          cards: column.cards.filter((card) => card.id !== cardId)
        }))
      )
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete card')
      throw error
    }
  }

  return {
    loading,
    error,
    board,
    columns,
    loadBoard,
    updateBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    setColumns,
    createCard,
    updateCard,
    moveCard,
    deleteCard
  }
}
