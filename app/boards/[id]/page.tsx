'use client'
import { useState, startTransition, useMemo } from 'react'
import { Filter, NewCard } from '@/types/types'
import { Column as ColumnType, Card as CardType, ColumnWithCards } from '@/lib/supabase/models'
import { useParams } from 'next/navigation'
import { SortableContext } from '@dnd-kit/sortable'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  rectIntersection,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { horizontalListSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useBoard } from '@/lib/hooks/useBoard'
import { useDragAndDrop } from '@/lib/hooks/useDragAndDrop'
import { useOptimisticColumns } from '@/lib/hooks/useOptimisticColumns'
import { useNotification } from '@/lib/utils/notifications'
import NavBar from '@/app/components/NavBar'
import BoardEditionModal from '@/app/components/Board/BoardEditionModal'
import BoardFiltersModal from '@/app/components/Board/BoardFiltersModal'
import BoardHeader from '@/app/components/Board/BoardHeader'
import Column from '@/app/components/Column'
import ColumnEditionModal from '@/app/components/Column/ColumnEditionModal'
import AddColumnButton from '@/app/components/Board/AddColumnButton'
import Card from '@/app/components/Card'
import CardEditionModal from '@/app/components/Card/CardEditionModal'
import LoaderPlaceHolder from '@/app/components/ui/LoaderPlaceHolder'

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const boardId = Number(id)
  const {
    loading,
    loadingBoard,
    board,
    columns,
    updateBoard,
    setColumns,
    createColumn,
    deleteColumn,
    updateColumn,
    moveColumn,
    createCard,
    updateCard,
    moveCard,
    deleteCard
  } = useBoard(boardId)
  const [isBoardEditing, setIsBoardEditing] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [filters, setFilters] = useState<Filter>({})
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [cardToEdit, setCardToEdit] = useState<NewCard | CardType | null>(null)
  const [columnTargetId, setColumnTargetId] = useState<number | null>(null)
  const [isEditingColumn, setIsEditingColumn] = useState(false)
  const [columnToEdit, setColumnToEdit] = useState<ColumnType | null>(null)
  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )
  const { activeCard, activeColumn, handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop(
    columns,
    setColumns,
    moveCard,
    moveColumn
  )
  const { optimisticColumns, updateOptimisticColumns } = useOptimisticColumns(columns)
  const { notifySuccess, notifyError } = useNotification()

  const handleUpdateBoard = async (title: string) => {
    if (!board || !title.trim()) return

    if (board.title === title.trim()) {
      setIsBoardEditing(false)
      return
    }

    try {
      await updateBoard(board.id, { title: title.trim() })
      notifySuccess('Board updated successfully')
    } catch (error) {
      notifyError('Failed to update board', 'Please try again.', error)
    } finally {
      setIsBoardEditing(false)
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
    if (!filters.priority || filters.priority.length === 0) {
      return optimisticColumns
    }

    return optimisticColumns.map((column) => ({
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
    const optimisticColumn = {
      id: tempId,
      title,
      position: columns.length,
      board_id: boardId,
      created_at: new Date().toISOString(),
      cards: []
    }

    startTransition(() => {
      updateOptimisticColumns({ type: 'createColumn', column: optimisticColumn })
    })

    try {
      await createColumn(title)
      notifySuccess('Column created')
    } catch (error) {
      notifyError('Failed to create column', 'Please try again.', error)
    } finally {
      setIsEditingColumn(false)
      setColumnToEdit(null)
    }
  }

  const handleUpdateColumn = async (column: ColumnWithCards) => {
    startTransition(() => {
      updateOptimisticColumns({ type: 'updateColumn', column })
    })

    try {
      await updateColumn(column)
      notifySuccess('Column updated')
    } catch (error) {
      notifyError('Failed to update column', `Column title: ${column.title}`, error)
    } finally {
      setIsEditingColumn(false)
      setColumnToEdit(null)
    }
  }

  const handleDeleteColumn = async (columnId: number) => {
    startTransition(() => {
      updateOptimisticColumns({ type: 'deleteColumn', columnId })
    })

    try {
      await deleteColumn(columnId)
      notifySuccess('Column deleted')
    } catch (error) {
      notifyError('Failed to delete column', `Column title: ${columnToEdit?.title}`, error)
    } finally {
      setIsEditingColumn(false)
      setColumnToEdit(null)
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
    const optimisticCard = {
      id: tempId,
      title: newCard.title.trim(),
      description: newCard.description || '',
      priority: newCard.priority,
      column_id: columnId,
      position: columns.find((col) => col.id === columnId)?.cards.length || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    startTransition(() => {
      updateOptimisticColumns({ type: 'create', card: optimisticCard })
    })

    try {
      await createCard(newCard, columnId)
      notifySuccess('Card created')
    } catch (error) {
      notifyError('Failed to create card', 'Please try again.', error)
    } finally {
      setIsAddingCard(false)
      setColumnTargetId(null)
      setCardToEdit(null)
    }
  }

  const handleUpdateCard = async (card: CardType, columnId: number | null) => {
    if (!card.title.trim()) return

    const targetColumnId = columnId || columns[0].id

    startTransition(async () => {
      updateOptimisticColumns({ type: 'update', card: { ...card, column_id: targetColumnId } })
    })

    try {
      await updateCard(card, targetColumnId)
      notifySuccess('Card updated')
    } catch (error) {
      notifyError('Failed to update card', 'Please try again.', error)
    } finally {
      setIsAddingCard(false)
      setColumnTargetId(null)
      setCardToEdit(null)
    }
  }

  const handleDeleteCard = async (cardId: number) => {
    startTransition(() => {
      updateOptimisticColumns({ type: 'delete', cardId, card: {} as CardType })
    })

    try {
      await deleteCard(cardId)
      notifySuccess('Card deleted')
    } catch (error) {
      notifyError('Failed to delete card', `Card title: ${cardToEdit?.title}`, error)
    } finally {
      setIsAddingCard(false)
      setColumnTargetId(null)
      setCardToEdit(null)
    }
  }

  const handleToggleFavorite = async () => {
    if (!board) return
    try {
      await updateBoard(board.id, { is_favorite: !board.is_favorite })
    } catch (error) {
      notifyError('Failed to toggle favorite', 'Please try again', error)
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

          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filteredColumns.map((col) => col.id)} strategy={horizontalListSortingStrategy}>
              <div
                id="board"
                className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto lg:pb-6 px-2 lg:px-4 space-y-4 lg:space-y-0 min-h-dvh"
              >
                {loadingBoard && filteredColumns.length === 0 && <LoaderPlaceHolder />}

                {filteredColumns?.map((column) => (
                  <Column
                    key={column.id}
                    column={column}
                    onCreateCard={() => handleEditCardModal(null, column.id)}
                    onEditColumn={() => handleEditColumnModal(column)}
                  >
                    <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                      {column.cards.map((card) => (
                        <Card
                          key={card.id}
                          card={card}
                          priorityOptions={filterOptions.priority}
                          onEditCard={(card: NewCard | CardType) => handleEditCardModal(card, column.id)}
                        />
                      ))}
                    </SortableContext>
                  </Column>
                ))}
                <AddColumnButton onAddColumn={() => handleEditColumnModal(null)} />
              </div>
            </SortableContext>

            <DragOverlay>
              {activeCard && (
                <div style={{ transform: 'rotate(2deg)', transition: 'transform 0.3s ease-out' }}>
                  <Card card={activeCard} priorityOptions={filterOptions.priority} />
                </div>
              )}
              {activeColumn && (
                <Column column={activeColumn}>
                  <div className="p-4 space-y-2">
                    {activeColumn.cards.map((card) => (
                      <Card key={card.id} card={card} priorityOptions={filterOptions.priority} />
                    ))}
                  </div>
                </Column>
              )}
            </DragOverlay>
          </DndContext>
        </main>
      </div>

      <ColumnEditionModal
        loading={loading}
        isOpen={isEditingColumn}
        column={columnToEdit}
        onClose={() => setIsEditingColumn(false)}
        onSave={(title) => handleCreateColumn(title)}
        onEdit={(column) => handleUpdateColumn(column)}
        onDeleteColumn={(columnId) => handleDeleteColumn(columnId)}
      />

      <CardEditionModal
        loading={loading}
        isOpen={isAddingCard}
        columnTargetId={columnTargetId}
        columns={columns}
        card={cardToEdit}
        filterOptions={filterOptions}
        onClose={() => setIsAddingCard(false)}
        onEdit={(newCard: CardType, columnId: number) => handleUpdateCard(newCard, columnId)}
        onSave={(newCard: NewCard, columnId: number) => handleCreateCard(newCard, columnId)}
        onDelete={(cardId: number) => handleDeleteCard(cardId)}
      />

      <BoardEditionModal
        loading={loading}
        isOpen={isBoardEditing}
        board={board}
        onClose={() => setIsBoardEditing(false)}
        onSubmit={(title: string) => handleUpdateBoard(title)}
      />

      <BoardFiltersModal
        isOpen={isFiltering}
        filters={filters}
        priorities={filterOptions}
        onReset={handleResetFilters}
        onClose={() => setIsFiltering(false)}
        onSubmit={(filters: Filter) => handleSubmitFilters(filters)}
      />
    </div>
  )
}
