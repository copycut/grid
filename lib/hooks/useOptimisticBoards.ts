import { useOptimistic } from 'react'
import { Board } from '@/lib/supabase/models'

export function useOptimisticBoards(boards: Board[]) {
  const [optimisticBoards, updateOptimisticBoards] = useOptimistic(
    boards,
    (
      currentBoards: Board[],
      action: {
        type: 'create' | 'delete'
        board?: Board
        boardId?: number
      }
    ): Board[] => {
      if (action.type === 'create' && action.board) {
        return [action.board, ...currentBoards]
      }

      if (action.type === 'delete' && action.boardId) {
        return currentBoards.filter((board) => board.id !== action.boardId)
      }

      return currentBoards
    }
  )

  return { optimisticBoards, updateOptimisticBoards }
}