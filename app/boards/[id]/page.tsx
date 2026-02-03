'use client'
import { useState, useOptimistic, startTransition } from 'react'
import { Filter, NewCard } from '@/types/types'
import { Column as ColumnType, Card as CardType, ColumnWithCards } from '@/lib/supabase/models'
import { useParams } from 'next/navigation'
import { useBoard } from '@/lib/hooks/useBoards'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import NavBar from '@/app/components/NavBar'
import CardEditionModal from '@/app/components/CardEditionModal'
import BoardEditionModal from '@/app/components/BoardEditionModal'
import BoardFiltersModal from '@/app/components/BoardFiltersModal'
import Column from '@/app/components/Column'
import Card from '@/app/components/Card'
import ColumnEditionModal from '@/app/components/ColumnEditionModal'
import { DndContext, DragOverlay, PointerSensor, rectIntersection, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDragAndDrop } from '@/lib/hooks/useDragAndDrop'
import { AddColumnButton } from '@/app/components/AddColumnButton'
import { useOptimisticColumns } from '@/lib/hooks/useOptimisticColumns'

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const boardId = Number(id)
  const {
    board,
    columns,
    updateBoard,
    setColumns,
    createColumn,
    deleteColumn,
    updateColumn,
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
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const { activeCard, handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop(columns, setColumns, moveCard)
  const { optimisticColumns, updateOptimisticColumns } = useOptimisticColumns(columns)

  const handleUpdateBoard = async (title: string) => {
    if (!board || !title.trim()) return

    try {
      await updateBoard(board.id, { title: title.trim() })
    } catch (error) {
      console.error(error)
    } finally {
      setIsBoardEditing(false)
    }
  }

  const filterOptions = {
    priority: [
      { value: 'default', label: 'None' },
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ]
  }

  const handleSubmitFilters = (filters: Filter) => {
    setFilters(filters)
    // TODO: filter cards

    setIsFiltering(false)
  }

  const handleResetFilters = () => {
    setFilters({ ...filters, priority: 'default' })
    setIsFiltering(false)
  }

  const filterCount = () => {
    return Object.keys(filters).reduce(
      (count, filterKey) => (filters[filterKey as keyof Filter] !== 'default' ? count + 1 : count),
      0
    )
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
    } catch (error) {
      console.error('Failed to create column:', error)
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
    } catch (error) {
      console.error('Failed to update column:', error)
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
    } catch (error) {
      console.error('Failed to delete column:', error)
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
    } catch (error) {
      console.error('Failed to create card:', error)
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
    } catch (error) {
      console.error('Failed to update card:', error)
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
    } catch (error) {
      console.error('Failed to delete card:', error)
    } finally {
      setIsAddingCard(false)
      setColumnTargetId(null)
      setCardToEdit(null)
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar
        boardTitle={board?.title}
        onEditBoard={() => setIsBoardEditing(true)}
        onFilter={() => setIsFiltering(true)}
        filterCount={filterCount()}
      />

      <main className="py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 space-x-4 sm:space-x-0 px-2 sm:px-4 ">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pb-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total cards: </span>
              <span>{columns?.reduce((count, column) => count + column.cards.length, 0)}</span>
            </div>
          </div>
          <div className="pb-2">
            <Button color="primary" variant="solid" onClick={() => handleEditCardModal(null, null)}>
              <PlusOutlined />
              Add Card
            </Button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div
            id="board"
            className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto lg:pb-6 px-2 lg:px-4 lg:[&::-webkit-scrollbar]:h2 lg:[&::-webkit-scrollbar-track]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-xl lg:[&::-webkit-scrollbar-thumb]:bg-gray-400 space-y-4 lg:space-y-0 h-[calc(100vh-200px)]"
          >
            {optimisticColumns?.map((column) => (
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
                      onEditCard={(card: NewCard | CardType) => handleEditCardModal(card, column.id)}
                    />
                  ))}
                </SortableContext>
              </Column>
            ))}

            <AddColumnButton onAddColumn={() => handleEditColumnModal(null)} />
          </div>

          <DragOverlay>{activeCard && <Card card={activeCard} onEditCard={() => {}} />}</DragOverlay>
        </DndContext>
      </main>

      <ColumnEditionModal
        isOpen={isEditingColumn}
        column={columnToEdit}
        onClose={() => setIsEditingColumn(false)}
        onSave={(title) => handleCreateColumn(title)}
        onEdit={(column) => handleUpdateColumn(column)}
        onDeleteColumn={(columnId) => handleDeleteColumn(columnId)}
      />

      <CardEditionModal
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
