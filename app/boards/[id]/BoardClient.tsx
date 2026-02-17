'use client'

import { useState, startTransition, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Filter, NewCard } from '@/types/types'
import {
  Board,
  Column as ColumnType,
  Card as CardType,
  ColumnWithCards,
  OptimisticCard,
  OptimisticColumn
} from '@/lib/supabase/models'
import { useOptimisticColumns } from '@/lib/hooks/useOptimisticColumns'
import { useNotification } from '@/lib/utils/notifications'
import { updateBoard as updateBoardAction } from '@/lib/actions/board.actions'
import {
  createColumn as createColumnAction,
  updateColumn as updateColumnAction,
  deleteColumn as deleteColumnAction
} from '@/lib/actions/column.actions'
import {
  createCard as createCardAction,
  updateCard as updateCardAction,
  deleteCard as deleteCardAction
} from '@/lib/actions/card.actions'
import NavBar from '@/app/components/NavBar'
import BoardHeader from '@/app/components/Board/BoardHeader'

const BoardContent = dynamic(() => import('./BoardContent'), { ssr: false })
const BoardEditionModal = dynamic(() => import('@/app/components/Board/BoardEditionModal'), { ssr: false })
const BoardFiltersModal = dynamic(() => import('@/app/components/Board/BoardFiltersModal'), { ssr: false })
const ColumnEditionModal = dynamic(() => import('@/app/components/Column/ColumnEditionModal'), { ssr: false })
const CardEditionModal = dynamic(() => import('@/app/components/Card/CardEditionModal'), { ssr: false })

interface BoardClientProps {
  initialBoard: Board
  initialColumns: ColumnWithCards[]
  boardId: number
}

export default function BoardClient({ initialBoard, initialColumns, boardId }: BoardClientProps) {
  const [board, setBoard] = useState(initialBoard)
  const [columns, setColumns] = useState(initialColumns)
  const [isBoardEditing, setIsBoardEditing] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [filters, setFilters] = useState<Filter>({})
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [cardToEdit, setCardToEdit] = useState<NewCard | CardType | null>(null)
  const [columnTargetId, setColumnTargetId] = useState<number | null>(null)
  const [isEditingColumn, setIsEditingColumn] = useState(false)
  const [columnToEdit, setColumnToEdit] = useState<ColumnType | null>(null)
  const [newlyCreatedCardId, setNewlyCreatedCardId] = useState<number | null>(null)
  const { optimisticColumns, updateOptimisticColumns } = useOptimisticColumns(columns)
  const { notifySuccess, notifyError } = useNotification()

  const handleUpdateBoard = async (title: string) => {
    if (!board || !title.trim()) return

    if (board.title === title.trim()) {
      setIsBoardEditing(false)
      return
    }

    try {
      const updatedBoard = await updateBoardAction(board.id, { title: title.trim() })
      setBoard(updatedBoard)
      notifySuccess('Board updated successfully')
      setIsBoardEditing(false)
    } catch (error) {
      notifyError('Failed to update board', 'Please try again.', error)
    }
  }

  const filterOptions = {
    priority: [
      { value: 'default', label: 'None', color: '' },
      { value: 'low', label: 'Low', color: 'green' },
      { value: 'medium', label: 'Medium', color: 'orange' },
      { value: 'high', label: 'High', color: 'red' }
    ]
  }

  const filteredColumns = useMemo(() => {
    const seenColumns = new Map<string, OptimisticColumn>()
    const uniqueColumns = (optimisticColumns as OptimisticColumn[]).filter((column) => {
      const key = `${column.title}-${column.board_id}`
      if (seenColumns.has(key)) {
        const existing = seenColumns.get(key)!
        if (column.isOptimistic) {
          return false
        }
        if (existing.isOptimistic) {
          seenColumns.set(key, column)
          return true
        }
        return false
      }
      seenColumns.set(key, column)
      return true
    })

    const deduplicatedColumns = uniqueColumns.map((column) => {
      const seenCards = new Map<string, OptimisticCard>()
      const uniqueCards = (column.cards as OptimisticCard[]).filter((card) => {
        const key = `${card.title}-${card.description}-${card.priority}-${card.column_id}`
        if (seenCards.has(key)) {
          const existing = seenCards.get(key)!
          if (card.isOptimistic) {
            return false
          }
          if (existing.isOptimistic) {
            seenCards.set(key, card)
            return true
          }
          return false
        }
        seenCards.set(key, card)
        return true
      })
      return { ...column, cards: uniqueCards }
    })

    if (!filters.priority || filters.priority.length === 0) {
      return deduplicatedColumns
    }

    return deduplicatedColumns.map((column) => ({
      ...column,
      cards: column.cards.filter((card) => filters.priority?.includes(card.priority))
    }))
  }, [optimisticColumns, filters.priority])

  const filteredCardsCount = useMemo(
    () => filteredColumns?.reduce((count, column) => count + column.cards.length, 0) || 0,
    [filteredColumns]
  )

  const totalCardsCount = useMemo(
    () => optimisticColumns?.reduce((count, column) => count + column.cards.length, 0) || 0,
    [optimisticColumns]
  )

  const handleSubmitFilters = (filters: Filter) => {
    setFilters(filters)
    setIsFiltering(false)
  }

  const handleResetFilters = () => {
    setFilters({ ...filters, priority: [] })
    setIsFiltering(false)
  }

  const filterCount = () => {
    return Object.keys(filters).reduce((count, filterKey) => {
      const value = filters[filterKey as keyof Filter]
      if (Array.isArray(value) && value.length > 0) {
        return count + value.length
      }
      return count
    }, 0)
  }

  const handleEditColumnModal = (column: ColumnType | null) => {
    setColumnToEdit(column)
    setIsEditingColumn(true)
  }

  const handleCreateColumn = async (title: string) => {
    if (!title) return

    const tempId = Date.now()
    const optimisticColumn: OptimisticColumn = {
      id: tempId,
      title,
      position: columns.length,
      board_id: boardId,
      created_at: new Date().toISOString(),
      cards: [],
      isOptimistic: true
    }

    startTransition(() => {
      updateOptimisticColumns({ type: 'createColumn', column: optimisticColumn })
    })

    setIsEditingColumn(false)
    setColumnToEdit(null)

    try {
      const createdColumn = await createColumnAction(title, boardId)
      setColumns((prev) => [...prev, { ...createdColumn, cards: [] }])

      notifySuccess('Column created')
    } catch (error) {
      notifyError('Failed to create column', 'Please try again.', error)
    }
  }

  const handleUpdateColumn = async (column: ColumnWithCards) => {
    startTransition(() => {
      updateOptimisticColumns({ type: 'updateColumn', column })
    })

    setIsEditingColumn(false)
    setColumnToEdit(null)

    try {
      const updatedColumn = await updateColumnAction(column.id, { title: column.title }, boardId)
      setColumns((prev) => prev.map((col) => (col.id === updatedColumn.id ? { ...col, ...updatedColumn } : col)))

      notifySuccess('Column updated')
    } catch (error) {
      notifyError('Failed to update column', `Column title: ${column.title}`, error)
    }
  }

  const handleDeleteColumn = async (columnId: number) => {
    startTransition(() => {
      updateOptimisticColumns({ type: 'deleteColumn', columnId })
    })

    setIsEditingColumn(false)
    setColumnToEdit(null)

    try {
      await deleteColumnAction(columnId, boardId)
      setColumns((prev) => prev.filter((col) => col.id !== columnId))

      notifySuccess('Column deleted')
    } catch (error) {
      notifyError('Failed to delete column', `Column title: ${columnToEdit?.title}`, error)
    }
  }

  const handleEditCardModal = (card: NewCard | CardType | null, columnId: number | null) => {
    setCardToEdit(card)
    setColumnTargetId(columnId || columns[0].id)
    setIsAddingCard(true)
  }

  const handleCreateCard = async (newCard: NewCard, columnId: number) => {
    if (!newCard.title.trim()) return

    const tempId = Date.now()
    const optimisticCard: OptimisticCard = {
      id: tempId,
      title: newCard.title.trim(),
      description: newCard.description || '',
      priority: newCard.priority,
      column_id: columnId,
      position: columns.find((col) => col.id === columnId)?.cards.length || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isOptimistic: true
    }

    startTransition(() => {
      updateOptimisticColumns({ type: 'create', card: optimisticCard })
    })

    setIsAddingCard(false)
    setColumnTargetId(null)
    setCardToEdit(null)

    try {
      const createdCard = await createCardAction(
        {
          title: newCard.title.trim(),
          description: newCard.description,
          priority: newCard.priority,
          position: optimisticCard.position
        },
        columnId,
        boardId
      )

      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === columnId) {
            return { ...col, cards: [...col.cards, createdCard] }
          }
          return col
        })
      )

      setNewlyCreatedCardId(createdCard.id)
      setTimeout(() => setNewlyCreatedCardId(null), 2000)

      notifySuccess('Card created')
    } catch (error) {
      notifyError('Failed to create card', 'Please try again.', error)
    }
  }

  const handleUpdateCard = async (card: CardType, columnId: number | null) => {
    if (!card.title.trim()) return

    const targetColumnId = columnId || columns[0].id

    startTransition(() => {
      updateOptimisticColumns({ type: 'update', card: { ...card, column_id: targetColumnId } })
    })

    setIsAddingCard(false)
    setColumnTargetId(null)
    setCardToEdit(null)

    try {
      const updatedCard = await updateCardAction(card.id, { ...card, column_id: targetColumnId }, boardId)

      setColumns((prev) =>
        prev.map((col) => {
          const filteredCards = col.cards.filter((c) => c.id !== updatedCard.id)

          if (col.id === targetColumnId) {
            return { ...col, cards: [...filteredCards, updatedCard] }
          }

          return { ...col, cards: filteredCards }
        })
      )

      notifySuccess('Card updated')
    } catch (error) {
      notifyError('Failed to update card', 'Please try again.', error)
    }
  }

  const handleDeleteCard = async (cardId: number) => {
    startTransition(() => {
      updateOptimisticColumns({ type: 'delete', cardId })
    })

    setIsAddingCard(false)
    setColumnTargetId(null)
    setCardToEdit(null)

    try {
      await deleteCardAction(cardId, boardId)

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.filter((card) => card.id !== cardId)
        }))
      )

      notifySuccess('Card deleted')
    } catch (error) {
      notifyError('Failed to delete card', 'Please try again.', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!board) return

    try {
      const updatedBoard = await updateBoardAction(board.id, { is_favorite: !board.is_favorite })
      setBoard(updatedBoard)
      notifySuccess(updatedBoard.is_favorite ? 'Added to favorites' : 'Removed from favorites')
    } catch (error) {
      notifyError('Failed to update favorite status', 'Please try again.', error)
    }
  }

  return (
    <div className="bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-950 dark:to-purple-950">
      <div className="min-h-screen dark:bg-gray-900/70">
        <NavBar
          boardTitle={board?.title}
          isFavorite={board?.is_favorite}
          boardId={board?.id}
          onToggleFavorite={handleToggleFavorite}
          onEditBoard={() => setIsBoardEditing(true)}
          onFilter={() => setIsFiltering(true)}
          filterCount={filterCount()}
        />

        <main className="py-4 sm:py-6">
          <BoardHeader
            filteredCardsCount={filteredCardsCount}
            totalCardsCount={totalCardsCount}
            filterCount={filterCount()}
            filters={filters}
            filterOptions={filterOptions}
            onResetFilters={handleResetFilters}
            onAddCard={() => handleEditCardModal(null, null)}
          />

          <BoardContent
            newlyCreatedCardId={newlyCreatedCardId}
            filteredColumns={filteredColumns}
            filterOptions={filterOptions}
            boardId={boardId}
            setColumns={setColumns}
            onEditCard={handleEditCardModal}
            onEditColumn={handleEditColumnModal}
            onAddColumn={() => handleEditColumnModal(null)}
          />
        </main>
      </div>

      <ColumnEditionModal
        loading={false}
        isOpen={isEditingColumn}
        column={columnToEdit}
        onClose={() => setIsEditingColumn(false)}
        onSave={(title) => handleCreateColumn(title)}
        onEdit={(column) => handleUpdateColumn(column)}
        onDeleteColumn={(columnId) => handleDeleteColumn(columnId)}
      />

      <CardEditionModal
        loading={false}
        isOpen={isAddingCard}
        card={cardToEdit}
        columnTargetId={columnTargetId}
        columns={columns}
        onClose={() => setIsAddingCard(false)}
        onSave={(card, columnId) => handleCreateCard(card, columnId)}
        onEdit={(card, columnId) => handleUpdateCard(card, columnId)}
        onDelete={(cardId) => handleDeleteCard(cardId)}
        filterOptions={filterOptions}
      />

      <BoardEditionModal
        isOpen={isBoardEditing}
        board={board}
        onClose={() => setIsBoardEditing(false)}
        onSubmit={(title) => handleUpdateBoard(title)}
      />

      <BoardFiltersModal
        isOpen={isFiltering}
        filters={filters}
        priorities={filterOptions}
        onClose={() => setIsFiltering(false)}
        onSubmit={handleSubmitFilters}
        onReset={handleResetFilters}
      />
    </div>
  )
}
