import { useOptimistic, useMemo } from 'react'
import { Card as CardType, Column as ColumnType, ColumnWithCards, OptimisticColumn } from '@/lib/supabase/models'
import { deduplicateOptimisticItems } from '@/lib/utils/deduplication'

export function useOptimisticColumns(columns: ColumnWithCards[]) {
  const [optimisticColumns, updateOptimisticColumns] = useOptimistic(
    columns,
    (
      currentColumns: ColumnWithCards[],
      action: {
        type: 'update' | 'create' | 'delete' | 'updateColumn' | 'createColumn' | 'deleteColumn'
        card?: CardType
        cardId?: number
        column?: ColumnType
        columnId?: number
      }
    ): ColumnWithCards[] => {
      if (action.type === 'create' && action.card) {
        return currentColumns.map((column) => {
          if (column.id === action.card!.column_id) {
            return { ...column, cards: [...column.cards, action.card!] }
          }
          return column
        })
      }

      if (action.type === 'delete') {
        return currentColumns.map((column) => ({
          ...column,
          cards: column.cards.filter((card) => card.id !== action.cardId)
        }))
      }

      if (action.type === 'createColumn' && action.column) {
        return [...currentColumns, { ...action.column, cards: [] }]
      }

      if (action.type === 'updateColumn' && action.column) {
        return currentColumns.map((col) =>
          col.id === action.column!.id ? { ...col, ...action.column, cards: col.cards } : col
        )
      }

      if (action.type === 'deleteColumn' && action.columnId) {
        return currentColumns.filter((col) => col.id !== action.columnId)
      }

      if (action.type === 'update' && action.card) {
        return currentColumns.map((column) => {
          // If card is in this column, update it in place
          if (column.cards.some((card) => card.id === action.card!.id)) {
            if (column.id === action.card!.column_id) {
              // Card stays in same column - update in place
              return {
                ...column,
                cards: column.cards.map((card) => (card.id === action.card!.id ? action.card! : card))
              }
            } else {
              // Card moved to different column - remove from this column
              return { ...column, cards: column.cards.filter((card) => card.id !== action.card!.id) }
            }
          } else if (column.id === action.card!.column_id) {
            // Card moved to this column - append to end
            return { ...column, cards: [...column.cards, action.card!] }
          }
          return column
        })
      }

      return currentColumns
    }
  )

  const deduplicatedColumns = useMemo(() => {
    const deduplicatedCols = deduplicateOptimisticItems(optimisticColumns as OptimisticColumn[], {
      getKey: (column) => `${column.title}-${column.board_id}`
    })

    return deduplicatedCols.map((column) => {
      const deduplicatedCards = deduplicateOptimisticItems(column.cards, {
        getKey: (card) => `${card.title}-${card.description}-${card.priority}-${card.column_id}`
      })

      return { ...column, cards: deduplicatedCards }
    })
  }, [optimisticColumns])

  return { optimisticColumns: deduplicatedColumns, updateOptimisticColumns }
}
