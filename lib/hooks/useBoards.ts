import { boardDataService, boardService, cardService } from '@/lib/services'
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

  return { loading, error, createBoard, loadBoards, boards }
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

  return { loading, error, loadBoard, updateBoard, createCard, updateCard, board, columns }
}
