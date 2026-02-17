import { useOptimistic, useMemo } from 'react'
import { Board, OptimisticBoard } from '@/lib/supabase/models'
import { deduplicateOptimisticItems } from '@/lib/utils/deduplication'

export function useOptimisticBoards(boards: Board[]) {
  const [optimisticBoards, updateOptimisticBoards] = useOptimistic(
    boards,
    (
      currentBoards: Board[],
      action: {
        type: 'create' | 'delete' | 'update'
        board?: OptimisticBoard
        boardId?: number
        updates?: Partial<Board>
      }
    ): Board[] => {
      if (action.type === 'create' && action.board) {
        return [action.board, ...currentBoards]
      }

      if (action.type === 'delete' && action.boardId) {
        return currentBoards.filter((board) => board.id !== action.boardId)
      }

      if (action.type === 'update' && action.boardId && action.updates) {
        return currentBoards.map((board) => (board.id === action.boardId ? { ...board, ...action.updates } : board))
      }

      return currentBoards
    }
  )

  const deduplicatedBoards = useMemo(() => {
    return deduplicateOptimisticItems(optimisticBoards as OptimisticBoard[], {
      getKey: (board) => `${board.title}-${board.background_color || 'null'}`
    })
  }, [optimisticBoards])

  return { optimisticBoards: deduplicatedBoards, updateOptimisticBoards }
}
