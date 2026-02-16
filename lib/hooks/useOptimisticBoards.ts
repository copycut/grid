import { useOptimistic } from 'react'
import { Board } from '@/lib/supabase/models'

export function useOptimisticBoards(boards: Board[]) {
  const [optimisticBoards, updateOptimisticBoards] = useOptimistic(
    boards,
    (
      currentBoards: Board[],
      action: {
        type: 'create' | 'delete' | 'update'
        board?: Board
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

  return { optimisticBoards, updateOptimisticBoards }
}
