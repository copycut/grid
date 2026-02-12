import { boardDataService } from '@/lib/services/board-data.service'
import { boardService } from '@/lib/services/board.service'
import { useUser } from '@clerk/clerk-react'
import { useCallback, useState } from 'react'
import { Board } from '@/lib/supabase/models'
import { useSupabase } from '@/lib/supabase/SupabaseProvider'

export function useBoards() {
  const { user } = useUser()
  const { supabase } = useSupabase()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadBoards = useCallback(
    async (signal?: AbortSignal) => {
      if (!user?.id) throw new Error('User not authenticated')

      try {
        setLoading(true)
        const boards = await boardService.getBoards(supabase!, user.id, signal)
        setBoards(boards)
        return boards
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load boards')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [user?.id, supabase]
  )

  const createBoard = useCallback(
    async (boardData: { title: string; createDefaultColumns?: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated')

      try {
        setLoading(true)
        const { board } = boardData.createDefaultColumns
          ? await boardDataService.createBoardWithDefaultColumns(supabase!, {
              title: boardData.title,
              user_id: user?.id
            })
          : await boardDataService.createBoardWithoutColumns(supabase!, {
              title: boardData.title,
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
    },
    [user?.id, supabase]
  )

  const updateBoard = useCallback(
    async (boardId: number, updates: Partial<Board>) => {
      if (!user?.id) throw new Error('User not authenticated')

      try {
        setLoading(true)
        const updatedBoard = await boardService.updateBoard(supabase!, boardId, updates, user.id)
        setBoards((prev) => prev.map((board) => (board.id === updatedBoard.id ? updatedBoard : board)))
        return updatedBoard
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to update board')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [user?.id, supabase]
  )

  const deleteBoard = useCallback(
    async (boardId: number) => {
      if (!user?.id) throw new Error('User not authenticated')

      try {
        setLoading(true)
        await boardService.deleteBoard(supabase!, boardId, user.id)
        setBoards((prev) => prev.filter((board) => board.id !== boardId))
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to delete board')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [user?.id, supabase]
  )

  return { loading, error, boards, createBoard, loadBoards, updateBoard, deleteBoard }
}
